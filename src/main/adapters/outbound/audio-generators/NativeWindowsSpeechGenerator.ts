import { spawn } from 'child_process'
import { existsSync, mkdirSync } from 'fs'
import { ILogger, ITextToSpeechGenerator } from '../../../hexagon'

import { Result } from '../../../shared-kernel'
import { AudioFileName } from '@hexagon/AudioFileName'

export class NativeWindowsSpeechGenerator implements ITextToSpeechGenerator {
  private constructor(
    private readonly _logger: ILogger,
    private readonly _audioDir: string
  ) {}

  public async generate(text: string): Promise<Result<AudioFileName, Error>> {
    const fileName = AudioFileName.createWAV(text, this._audioDir)

    try {
      const psCommand = `Add-Type -AssemblyName System.speech;$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer;$speak.SetOutputToWaveFile('${fileName.fullPath}');$speak.Speak([Console]::In.ReadToEnd());$speak.Dispose()`
      const ps = spawn('powershell', ['-Command', psCommand], { shell: true })

      await new Promise((resolve, reject) => {
        ps.on('error', reject)
        ps.on('close', (code) => {
          if (code === 0) {
            this._logger.info(`TTS audio saved to ${fileName.fullPath}`)
            resolve(Result.ok(fileName))
          } else {
            reject(new Error(`PowerShell exited with code ${code}`))
          }
        })

        ps.stdin.write(text)
        ps.stdin.end()
      })

      this._logger.info('TTS audio saved to', { fileName: fileName.fullPath })
      return Result.ok(fileName)
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
}
