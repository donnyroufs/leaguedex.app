import path from 'path'
import fs from 'fs/promises'
import { exec } from 'child_process'
import { promisify } from 'util'
import { spawn } from 'child_process'

import { Result } from '../shared-kernel'
import { ILogger } from '../shared-kernel/ILogger'
import { ITextToSpeech } from './ITextToSpeech'

const execAsync = promisify(exec)

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
      const outputPath = path.join(this._audioDir, `${filename}.${ext}`)

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

      this._logger.info(`TTS audio saved to ${outputPath}`)
      return Result.ok(outputPath)
    } catch (err) {
      this._logger.error(`TTS generation failed: ${(err as Error).message}`)
      return Result.err(err as Error)
    }
  }

  public static async create(
    logger: ILogger,
    audioDir: string,
    platform: 'win32' | 'darwin'
  ): Promise<ITextToSpeech> {
    try {
      await fs.access(audioDir)
    } catch {
      await fs.mkdir(audioDir, { recursive: true })
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
