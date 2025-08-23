import { spawn, exec } from 'child_process'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { promisify } from 'util'
import { ILogger } from '../../hexagon'
import { ITextToSpeech } from '../../hexagon'

import { Result } from '../../shared-kernel'

const execAsync = promisify(exec)


// TODO: test this
export class TextToSpeech implements ITextToSpeech {
  private constructor(
    private readonly _logger: ILogger,
    private readonly _audioDir: string,
    private readonly _platform: 'win32' | 'darwin'
  ) {}

  public async generate(text: string): Promise<Result<string, Error>> {
    try {
      const filename = this.createFileName(text)
      const ext = this._platform === 'win32' ? 'wav' : this._platform === 'darwin' ? 'aiff' : 'wav'
      const outputPath = join(this._audioDir, `${filename}.${ext}`)

      if (this._platform === 'darwin') {
        const cmd = `say -o "${outputPath}" "${text}"`
        await execAsync(cmd)
      } else if (this._platform === 'win32') {
        const psCommand = `Add-Type -AssemblyName System.speech;$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer;$speak.SetOutputToWaveFile('${outputPath}');$speak.Speak([Console]::In.ReadToEnd());$speak.Dispose()`
        const ps = spawn('powershell', ['-Command', psCommand], { shell: true })

        return new Promise((resolve, reject) => {
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
      } else {
        throw new Error(`Unsupported platform: ${this._platform}`)
      }

      this._logger.info('TTS audio saved to', { outputPath })
      return Result.ok(outputPath)
    } catch (err) {
      this._logger.error('TTS generation failed', { err })
      return Result.err(err as Error)
    }
  }

  public static async create(
    logger: ILogger,
    audioDir: string,
    platform: 'win32' | 'darwin'
  ): Promise<ITextToSpeech> {
    try {
      if (!existsSync(audioDir)) {
        mkdirSync(audioDir, { recursive: true })
      }
    } catch (err) {
      logger.error('Failed to create audio directory', { err })
      throw new Error(`Failed to create audio directory: ${audioDir}`)
    }

    return new TextToSpeech(logger, audioDir, platform)
  }

  private createFileName(text: string): string {
    return text
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase()
  }
}
