import { spawn } from 'child_process'
import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { ILogger, ITextToSpeechGenerator } from '../../../hexagon'

import { Result } from '../../../shared-kernel'
import { AudioFileName } from '@hexagon/AudioFileName'

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

  public static async create(
    logger: ILogger,
    audioDir: string,
    resourcesPath: string
  ): Promise<SherpaSpeechGenerator> {
    try {
      if (!existsSync(audioDir)) {
        mkdirSync(audioDir, { recursive: true })
      }
    } catch (err) {
      logger.error('Failed to create audio directory', { err })
      throw new Error(`Failed to create audio directory: ${audioDir}`)
    }

    const sherpaPath = join(resourcesPath, 'sherpa', 'bin', 'sherpa-onnx-offline-tts.exe')
    const voiceDir = join(resourcesPath, 'sherpa', 'voices', 'kokoro-en-v0_19')
    const modelPath = join(voiceDir, 'model.onnx')
    const tokensPath = join(voiceDir, 'tokens.txt')
    const dataDir = join(voiceDir, 'espeak-ng-data')
    const voicesPath = join(voiceDir, 'voices.bin')
    const speakerId = 5 // Adam voice (am_adam)

    const requiredPaths = [
      { path: sherpaPath, name: 'Sherpa executable' },
      { path: modelPath, name: 'Kokoro model' },
      { path: tokensPath, name: 'Tokens file' },
      { path: dataDir, name: 'Espeak data directory' },
      { path: voicesPath, name: 'Voices file' }
    ]

    for (const { path, name } of requiredPaths) {
      if (!existsSync(path)) {
        logger.error(`${name} not found at path`, { path })
        throw new Error(`${name} not found at: ${path}`)
      }
    }

    logger.info('Sherpa-ONNX TTS initialized successfully with Kokoro', {
      sherpaPath,
      voiceDir,
      speakerId
    })

    return new SherpaSpeechGenerator(
      logger,
      audioDir,
      sherpaPath,
      modelPath,
      tokensPath,
      dataDir,
      voicesPath,
      speakerId
    )
  }
}
