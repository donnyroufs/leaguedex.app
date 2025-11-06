import { ILogger, ITextToSpeechGenerator } from '../../../hexagon'
import { NativeWindowsSpeechGenerator } from './NativeWindowsSpeechGenerator'
import { SherpaSpeechGenerator } from './SherpaSpeechGenerator'
import { DevSpeechGenerator } from './DevSpeechGenerator'

export class AudioGeneratorFactory {
  public static async create(
    isProd: boolean,
    audioDir: string,
    logger: ILogger,
    resourcesPath: string
  ): Promise<ITextToSpeechGenerator> {
    if (isProd) {
      try {
        return await SherpaSpeechGenerator.create(logger, audioDir, resourcesPath)
      } catch (err) {
        logger.error('Failed to initialize Sherpa-ONNX, falling back to Windows SAPI', { err })
        return await NativeWindowsSpeechGenerator.create(logger, audioDir)
      }
    } else {
      return new DevSpeechGenerator()
    }
  }
}
