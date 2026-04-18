import { ILogger, ITextToSpeechGenerator } from '../../../hexagon'
import { SpeechEngineConfig } from '@hexagon/IUserSettingsDto'
import { NativeWindowsSpeechGenerator } from './NativeWindowsSpeechGenerator'
import { SherpaSpeechGenerator } from './SherpaSpeechGenerator'
import { DevSpeechGenerator } from './DevSpeechGenerator'
import { NotConfiguredSpeechGenerator } from './NotConfiguredSpeechGenerator'
import { OpenAISpeechGenerator } from './OpenAISpeechGenerator'
import { ApiKeyVault } from '../ApiKeyVault'

export class AudioGeneratorFactory {
  public static async create(
    isProd: boolean,
    audioDir: string,
    logger: ILogger,
    installRoot: string,
    speech: SpeechEngineConfig | null
  ): Promise<ITextToSpeechGenerator> {
    if (!isProd) {
      return new DevSpeechGenerator()
    }

    if (speech === null) {
      return new NotConfiguredSpeechGenerator()
    }

    if (speech.type === 'openai') {
      try {
        const apiKey = ApiKeyVault.decrypt(speech.encryptedApiKey)
        return new OpenAISpeechGenerator(logger, audioDir, apiKey, speech.model, speech.voice)
      } catch (err) {
        logger.error('Failed to initialize OpenAI speech generator', { err })
        return new NotConfiguredSpeechGenerator()
      }
    }

    // speech.type === 'local'
    if (!SherpaSpeechGenerator.isInstalled(installRoot)) {
      return new NotConfiguredSpeechGenerator()
    }

    try {
      return await SherpaSpeechGenerator.create(logger, audioDir, installRoot)
    } catch (err) {
      logger.error('Failed to initialize Sherpa-ONNX, falling back to Windows SAPI', { err })
      return await NativeWindowsSpeechGenerator.create(logger, audioDir)
    }
  }
}
