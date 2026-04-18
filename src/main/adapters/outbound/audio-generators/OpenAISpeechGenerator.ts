import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'

import { ILogger, ITextToSpeechGenerator } from '../../../hexagon'
import { AudioFileName } from '@hexagon/AudioFileName'
import { Result } from '../../../shared-kernel'
import { OpenAITtsModel, OpenAITtsVoice } from '@hexagon/IUserSettingsDto'

export class OpenAISpeechGenerator implements ITextToSpeechGenerator {
  public constructor(
    private readonly _logger: ILogger,
    private readonly _audioDir: string,
    private readonly _apiKey: string,
    private readonly _model: OpenAITtsModel,
    private readonly _voice: OpenAITtsVoice
  ) {}

  public async generate(text: string): Promise<Result<AudioFileName, Error>> {
    const fileName = AudioFileName.createWAV(text)
    const fullPath = fileName.fullPath(this._audioDir)

    try {
      if (!existsSync(this._audioDir)) {
        await mkdir(this._audioDir, { recursive: true })
      }

      this._logger.info('Generating TTS via OpenAI', {
        model: this._model,
        voice: this._voice,
        outputFile: fullPath
      })

      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this._apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this._model,
          voice: this._voice,
          input: text,
          response_format: 'wav'
        })
      })

      if (!response.ok) {
        const body = await response.text().catch(() => '')
        return Result.err(
          new Error(`OpenAI TTS failed (${response.status} ${response.statusText}): ${body}`)
        )
      }

      const buffer = Buffer.from(await response.arrayBuffer())
      await writeFile(fullPath, buffer)

      return Result.ok(fileName)
    } catch (err) {
      this._logger.error('OpenAI TTS generation failed', { err })
      return Result.err(err as Error)
    }
  }
}
