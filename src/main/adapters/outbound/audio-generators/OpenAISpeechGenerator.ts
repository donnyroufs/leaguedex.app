import { AxiosInstance } from 'axios'
import { join } from 'path'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { Result } from '../../../shared-kernel'
import { getLicenseKey } from '../../../getLicenseKey'
import { ITextToSpeechGenerator } from '../../../hexagon'

// TODO: test this
export class OpenAISpeechGenerator implements ITextToSpeechGenerator {
  private constructor(
    private readonly _axios: AxiosInstance,
    private readonly _audioDir: string
  ) {}

  public async generate(text: string): Promise<Result<string, Error>> {
    try {
      if (!existsSync(this._audioDir)) {
        mkdirSync(this._audioDir, { recursive: true })
      }

      const filename = this.createFileName(text)
      const outputPath = join(this._audioDir, `${filename}.mp3`)

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
      writeFileSync(outputPath, buffer)

      return Result.ok(outputPath)
    } catch (err) {
      return Result.err(err as Error)
    }
  }

  private createFileName(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .trim()
  }

  public static create(axios: AxiosInstance, audioDir: string): OpenAISpeechGenerator {
    return new OpenAISpeechGenerator(axios, audioDir)
  }
}
