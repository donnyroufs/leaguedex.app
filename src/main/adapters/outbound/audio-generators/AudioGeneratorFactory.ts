import { ILogger, ITextToSpeechGenerator } from '../../../hexagon'
import { OpenAISpeechGenerator } from './OpenAISpeechGenerator'
import { NativeWindowsSpeechGenerator } from './NativeWindowsSpeechGenerator'
import { DevSpeechGenerator } from './DevSpeechGenerator'
import { AxiosInstance } from 'axios'

export class AudioGeneratorFactory {
  public static async create(
    isProd: boolean,
    audioDir: string,
    licenseKey: string,
    axios: AxiosInstance,
    logger: ILogger
  ): Promise<ITextToSpeechGenerator> {
    if (isProd && licenseKey.length > 0) {
      return OpenAISpeechGenerator.create(axios, audioDir)
    } else if (isProd && !licenseKey) {
      return await NativeWindowsSpeechGenerator.create(logger, audioDir)
    } else {
      return new DevSpeechGenerator()
    }
  }
}
