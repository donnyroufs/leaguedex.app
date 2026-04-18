import type { ILogger } from './ports/ILogger'
import type { ISpeechEngineAdapter } from './ports/ISpeechEngineAdapter'
import type { IUserSettingsRepository } from './ports/IUserSettingsRepository'
import type {
  OpenAITtsModel,
  OpenAITtsVoice,
  SpeechEngineConfig,
  SpeechEngineInput,
  SpeechEngineView
} from './IUserSettingsDto'

const OPENAI_MODELS: readonly OpenAITtsModel[] = ['tts-1', 'tts-1-hd']
const OPENAI_VOICES: readonly OpenAITtsVoice[] = [
  'alloy',
  'nova',
  'echo',
  'fable',
  'onyx',
  'shimmer'
]

export class SpeechEngineService {
  public constructor(
    private readonly _adapter: ISpeechEngineAdapter,
    private readonly _settings: IUserSettingsRepository,
    private readonly _logger: ILogger
  ) {}

  public async getView(): Promise<SpeechEngineView> {
    const settings = (await this._settings.load()).unwrap()
    const speech = settings.speech
    if (!speech) return null

    if (speech.type === 'local') {
      return {
        type: 'local',
        status: this._adapter.isLocalInstalled() ? 'installed' : 'not-installed'
      }
    }

    let masked = '••••••••'
    try {
      masked = this._adapter.maskApiKey(this._adapter.decryptApiKey(speech.encryptedApiKey))
    } catch (err) {
      this._logger.error('Failed to decrypt stored OpenAI API key', { err })
    }

    return {
      type: 'openai',
      maskedApiKey: masked,
      model: speech.model,
      voice: speech.voice
    }
  }

  public async update(input: SpeechEngineInput): Promise<void> {
    const settings = (await this._settings.load()).unwrap()

    const next = await this.buildConfigFromInput(input, settings.speech)

    await this._settings.save({ ...settings, speech: next })

    const generator = await this._adapter.buildGenerator(next)
    this._adapter.reconfigureTts(generator)

    this._logger.info('Speech engine updated', { type: next?.type ?? 'none' })
  }

  public async installLocal(): Promise<void> {
    const settings = (await this._settings.load()).unwrap()

    const res = await this._adapter.installLocal()
    if (res.isErr()) {
      throw res.getError()
    }

    const next: SpeechEngineConfig = { type: 'local', status: 'installed' }
    await this._settings.save({ ...settings, speech: next })

    const generator = await this._adapter.buildGenerator(next)
    this._adapter.reconfigureTts(generator)
  }

  public async testOpenAI(
    apiKey: string,
    model: OpenAITtsModel,
    voice: OpenAITtsVoice
  ): Promise<void> {
    const res = await this._adapter.testOpenAI(apiKey, model, voice)
    if (res.isErr()) {
      throw res.getError()
    }
  }

  private async buildConfigFromInput(
    input: SpeechEngineInput,
    existing: SpeechEngineConfig | null
  ): Promise<SpeechEngineConfig> {
    if (input.type === 'local') {
      return {
        type: 'local',
        status: this._adapter.isLocalInstalled() ? 'installed' : 'not-installed'
      }
    }

    if (!OPENAI_MODELS.includes(input.model)) {
      throw new Error(`Unsupported OpenAI model: ${input.model}`)
    }
    if (!OPENAI_VOICES.includes(input.voice)) {
      throw new Error(`Unsupported OpenAI voice: ${input.voice}`)
    }

    let encryptedApiKey: string
    if (input.apiKey) {
      encryptedApiKey = this._adapter.encryptApiKey(input.apiKey)
    } else if (existing && existing.type === 'openai') {
      encryptedApiKey = existing.encryptedApiKey
    } else {
      throw new Error('An API key is required when first selecting the OpenAI engine.')
    }

    return {
      type: 'openai',
      encryptedApiKey,
      model: input.model,
      voice: input.voice
    }
  }
}
