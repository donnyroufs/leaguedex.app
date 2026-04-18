import type { ILogger, ISpeechEngineAdapter, ITextToSpeechGenerator } from '../../hexagon'
import type { OpenAITtsModel, OpenAITtsVoice, SpeechEngineConfig } from '@hexagon/IUserSettingsDto'

import { Result } from '../../shared-kernel'
import { ApiKeyVault } from './ApiKeyVault'
import { SherpaModelInstaller } from './SherpaModelInstaller'
import { AudioGeneratorFactory } from './audio-generators/AudioGeneratorFactory'
import { ConfigurableTtsProxy } from './audio-generators/ConfigurableTtsProxy'
import { OpenAISpeechGenerator } from './audio-generators/OpenAISpeechGenerator'
import { soundPlay } from './SoundPlay'

export class ElectronSpeechEngineAdapter implements ISpeechEngineAdapter {
  public constructor(
    private readonly _logger: ILogger,
    private readonly _isProd: boolean,
    private readonly _audioDir: string,
    private readonly _installRoot: string,
    private readonly _proxy: ConfigurableTtsProxy,
    private readonly _installer: SherpaModelInstaller
  ) {}

  public encryptApiKey(plain: string): string {
    return ApiKeyVault.encrypt(plain)
  }

  public decryptApiKey(cipher: string): string {
    return ApiKeyVault.decrypt(cipher)
  }

  public maskApiKey(plain: string): string {
    return ApiKeyVault.mask(plain)
  }

  public isLocalInstalled(): boolean {
    return this._installer.isInstalled()
  }

  public installLocal(): Promise<Result<void, Error>> {
    return this._installer.install()
  }

  public buildGenerator(config: SpeechEngineConfig | null): Promise<ITextToSpeechGenerator> {
    return AudioGeneratorFactory.create(
      this._isProd,
      this._audioDir,
      this._logger,
      this._installRoot,
      config
    )
  }

  public reconfigureTts(next: ITextToSpeechGenerator): void {
    this._proxy.reconfigure(next)
  }

  public async testOpenAI(
    apiKey: string,
    model: OpenAITtsModel,
    voice: OpenAITtsVoice
  ): Promise<Result<void, Error>> {
    const probe = new OpenAISpeechGenerator(this._logger, this._audioDir, apiKey, model, voice)
    const res = await probe.generate('Hello from your Leaguedex assistant.')
    if (res.isErr()) return Result.err(res.getError())

    const audioName = res.getValue()
    try {
      await soundPlay.play(audioName.fullPath(this._audioDir), 1)
    } catch (err) {
      this._logger.error('Test audio generated but failed to play', { err })
    }
    return Result.ok(undefined)
  }
}
