import { spawn } from 'child_process'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { ILogger, ITextToSpeechGenerator } from '../../../hexagon'

import { Result } from '../../../shared-kernel'

export class NativeWindowsSpeechGenerator implements ITextToSpeechGenerator {
  private constructor(
    private readonly _logger: ILogger,
    private readonly _audioDir: string
  ) {}

  public async generate(text: string): Promise<Result<string, Error>> {
    try {
      const filename = this.createFileName(text)
      const outputPath = join(this._audioDir, `${filename}.wav`)

      const psCommand = `Add-Type -AssemblyName System.speech;$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer;$speak.SetOutputToWaveFile('${outputPath}');$speak.Speak([Console]::In.ReadToEnd());$speak.Dispose()`
      const ps = spawn('powershell', ['-Command', psCommand], { shell: true })

      await new Promise((resolve, reject) => {
        ps.on('error', reject)
        ps.on('close', (code) => {
          if (code === 0) {
            this._logger.info(`TTS audio saved to ${outputPath}`)
            resolve(Result.ok(outputPath))
          } else {
            reject(new Error(`PowerShell exited with code ${code}`))
          }
        })

        ps.stdin.write(text)
        ps.stdin.end()
      })

      this._logger.info('TTS audio saved to', { outputPath })
      return Result.ok(outputPath)
    } catch (err) {
      this._logger.error('TTS generation failed', { err })
      return Result.err(err as Error)
    }
  }

  public static async create(
    logger: ILogger,
    audioDir: string
  ): Promise<NativeWindowsSpeechGenerator> {
    try {
      if (!existsSync(audioDir)) {
        mkdirSync(audioDir, { recursive: true })
      }
    } catch (err) {
      logger.error('Failed to create audio directory', { err })
      throw new Error(`Failed to create audio directory: ${audioDir}`)
    }

    return new NativeWindowsSpeechGenerator(logger, audioDir)
  }

  private createFileName(text: string): string {
    return text
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase()
  }
}
