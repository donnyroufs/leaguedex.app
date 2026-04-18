import { spawn } from 'child_process'
import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { ILogger, ITextToSpeechGenerator } from '../../../hexagon'

import { Result } from '../../../shared-kernel'
import { AudioFileName } from '@hexagon/AudioFileName'

const SHERPA_SUBDIR = 'sherpa'
const VOICE_SUBDIR = join('voices', 'kokoro-en-v0_19')

export class SherpaSpeechGenerator implements ITextToSpeechGenerator {
  private constructor(
    private readonly _logger: ILogger,
    private readonly _audioDir: string,
    private readonly _sherpaPath: string,
    private readonly _modelPath: string,
    private readonly _tokensPath: string,
    private readonly _dataDir: string,
    private readonly _voicesPath: string,
    private readonly _speakerId: number
  ) {}

  public async generate(text: string): Promise<Result<AudioFileName, Error>> {
    const fileName = AudioFileName.createWAV(text)
    const fullPath = fileName.fullPath(this._audioDir)

    try {
      const args = [
        `--kokoro-model=${this._modelPath}`,
        `--kokoro-tokens=${this._tokensPath}`,
        `--kokoro-data-dir=${this._dataDir}`,
        `--kokoro-voices=${this._voicesPath}`,
        `--sid=${this._speakerId}`,
        `--output-filename=${fullPath}`,
        text
      ]

      this._logger.info('Generating TTS audio with Sherpa-ONNX', {
        sherpaPath: this._sherpaPath,
        outputFile: fullPath
      })

      const sherpa = spawn(this._sherpaPath, args)

      let stderr = ''
      sherpa.stderr.on('data', (data) => {
        stderr += data.toString()
      })

      await new Promise((resolve, reject) => {
        sherpa.on('error', (err) => {
          this._logger.error('Failed to spawn Sherpa process', { err })
          reject(new Error(`Failed to spawn Sherpa: ${err.message}`))
        })

        sherpa.on('close', (code) => {
          if (code === 0) {
            this._logger.info('TTS audio saved successfully', {
              fileName: fullPath
            })
            resolve(Result.ok(fileName))
          } else {
            this._logger.error('Sherpa process failed', { code, stderr })
            reject(new Error(`Sherpa exited with code ${code}: ${stderr}`))
          }
        })
      })

      return Result.ok(fileName)
    } catch (err) {
      this._logger.error('TTS generation failed', { err })
      return Result.err(err as Error)
    }
  }

  public static sherpaPaths(installRoot: string): {
    sherpaPath: string
    modelPath: string
    tokensPath: string
    dataDir: string
    voicesPath: string
  } {
    const voiceDir = join(installRoot, SHERPA_SUBDIR, VOICE_SUBDIR)
    return {
      sherpaPath: join(installRoot, SHERPA_SUBDIR, 'bin', 'sherpa-onnx-offline-tts.exe'),
      modelPath: join(voiceDir, 'model.onnx'),
      tokensPath: join(voiceDir, 'tokens.txt'),
      dataDir: join(voiceDir, 'espeak-ng-data'),
      voicesPath: join(voiceDir, 'voices.bin')
    }
  }

  public static isInstalled(installRoot: string): boolean {
    const paths = SherpaSpeechGenerator.sherpaPaths(installRoot)
    return (
      existsSync(paths.sherpaPath) &&
      existsSync(paths.modelPath) &&
      existsSync(paths.tokensPath) &&
      existsSync(paths.dataDir) &&
      existsSync(paths.voicesPath)
    )
  }

  public static async create(
    logger: ILogger,
    audioDir: string,
    installRoot: string
  ): Promise<SherpaSpeechGenerator> {
    try {
      if (!existsSync(audioDir)) {
        mkdirSync(audioDir, { recursive: true })
      }
    } catch (err) {
      logger.error('Failed to create audio directory', { err })
      throw new Error(`Failed to create audio directory: ${audioDir}`)
    }

    const paths = SherpaSpeechGenerator.sherpaPaths(installRoot)
    const speakerId = 5 // Adam voice (am_adam)

    const requiredPaths = [
      { path: paths.sherpaPath, name: 'Sherpa executable' },
      { path: paths.modelPath, name: 'Kokoro model' },
      { path: paths.tokensPath, name: 'Tokens file' },
      { path: paths.dataDir, name: 'Espeak data directory' },
      { path: paths.voicesPath, name: 'Voices file' }
    ]

    for (const { path, name } of requiredPaths) {
      if (!existsSync(path)) {
        logger.error(`${name} not found at path`, { path })
        throw new Error(`${name} not found at: ${path}`)
      }
    }

    logger.info('Sherpa-ONNX TTS initialized successfully with Kokoro', {
      sherpaPath: paths.sherpaPath,
      installRoot,
      speakerId
    })

    return new SherpaSpeechGenerator(
      logger,
      audioDir,
      paths.sherpaPath,
      paths.modelPath,
      paths.tokensPath,
      paths.dataDir,
      paths.voicesPath,
      speakerId
    )
  }
}
