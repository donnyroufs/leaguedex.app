import type { ITextToSpeechGenerator } from './ITextToSpeechGenerator'
import type { Result } from '../../shared-kernel'
import type { OpenAITtsModel, OpenAITtsVoice, SpeechEngineConfig } from '../IUserSettingsDto'

export interface ISpeechEngineAdapter {
  encryptApiKey(plain: string): string
  decryptApiKey(cipher: string): string
  maskApiKey(plain: string): string
  isLocalInstalled(): boolean
  installLocal(): Promise<Result<void, Error>>
  buildGenerator(config: SpeechEngineConfig | null): Promise<ITextToSpeechGenerator>
  reconfigureTts(next: ITextToSpeechGenerator): void
  testOpenAI(
    apiKey: string,
    model: OpenAITtsModel,
    voice: OpenAITtsVoice
  ): Promise<Result<void, Error>>
}
