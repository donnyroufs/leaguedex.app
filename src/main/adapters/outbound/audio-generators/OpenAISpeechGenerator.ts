import { AxiosInstance } from 'axios'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { Result } from '../../../shared-kernel'
import { getLicenseKey } from '../../../getLicenseKey'
import { ITextToSpeechGenerator } from '../../../hexagon'
import { AudioFileName } from '@hexagon/AudioFileName'

export class OpenAISpeechGenerator implements ITextToSpeechGenerator {
  private constructor(
    private readonly _axios: AxiosInstance,
    private readonly _audioDir: string
  ) {}

  public async generate(text: string): Promise<Result<AudioFileName, Error>> {
    try {
      if (!existsSync(this._audioDir)) {
        mkdirSync(this._audioDir, { recursive: true })
      }

      const fileName = AudioFileName.createMP3(text, this._audioDir)

      const response = await this._axios.post(
        '/tts/generate',
        { text },
        {
          responseType: 'arraybuffer',
          headers: {
            'X-Api-Key': await getLicenseKey()
          }
        }
      )

      if (response.status !== 200) {
        return Result.err(new Error('Failed to generate TTS audio'))
      }

      const buffer = Buffer.from(response.data)
      writeFileSync(fileName.fullPath, buffer)

      return Result.ok(fileName)
    } catch (err) {
      return Result.err(err as Error)
    }
  }

  public static create(axios: AxiosInstance, audioDir: string): OpenAISpeechGenerator {
    return new OpenAISpeechGenerator(axios, audioDir)
  }
}
