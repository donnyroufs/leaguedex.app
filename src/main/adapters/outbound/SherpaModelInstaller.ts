import { createWriteStream } from 'fs'
import { cp, mkdir, rm, stat, unlink } from 'fs/promises'
import { join } from 'path'
import { pipeline } from 'stream/promises'
import { Readable } from 'stream'

import extract from 'extract-zip'

import { ILogger } from '../../hexagon'
import { IModelDownloadProgressReporter } from '../../hexagon/ports/IModelDownloadProgressReporter'
import { Result } from '../../shared-kernel'
import { SherpaSpeechGenerator } from './audio-generators/SherpaSpeechGenerator'

/**
 * URL of the packaged Sherpa-ONNX + Kokoro v0.19 runtime for Windows x64.
 * Override via LEAGUEDEX_SHERPA_ASSET_URL for testing / mirrors.
 * The asset must be a zip whose top-level directory is `sherpa/` containing
 * `bin/sherpa-onnx-offline-tts.exe` and `voices/kokoro-en-v0_19/...`.
 */
const DEFAULT_ASSET_URL =
  'https://github.com/donnyroufs/leaguedex.app/releases/download/sherpa-kokoro-v0_19/sherpa-kokoro-v0_19-win-x64.zip'

export class SherpaModelInstaller {
  public constructor(
    private readonly _logger: ILogger,
    private readonly _installRoot: string,
    private readonly _progress: IModelDownloadProgressReporter,
    /** When set, install() copies this directory as-is to <installRoot>/sherpa instead of downloading. */
    private readonly _localSourceDir: string | null = null,
    private readonly _assetUrl: string = process.env.LEAGUEDEX_SHERPA_ASSET_URL ?? DEFAULT_ASSET_URL
  ) {}

  public isInstalled(): boolean {
    return SherpaSpeechGenerator.isInstalled(this._installRoot)
  }

  public async install(): Promise<Result<void, Error>> {
    try {
      await mkdir(this._installRoot, { recursive: true })
      await rm(join(this._installRoot, 'sherpa'), { recursive: true, force: true })

      if (this._localSourceDir) {
        await this.installFromLocal(this._localSourceDir)
      } else {
        await this.installFromUrl(this._assetUrl)
      }

      if (!this.isInstalled()) {
        throw new Error('Install completed but required Sherpa files are missing.')
      }

      this._logger.info('Sherpa/Kokoro install complete')
      this._progress.reportComplete()
      return Result.ok(undefined)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      this._logger.error('Sherpa/Kokoro install failed', { err })
      this._progress.reportError(message)
      return Result.err(err as Error)
    }
  }

  private async installFromLocal(sourceDir: string): Promise<void> {
    const exists = await stat(sourceDir).catch(() => null)
    if (!exists?.isDirectory()) {
      throw new Error(`Local Sherpa source directory not found: ${sourceDir}`)
    }
    this._logger.info('Copying Sherpa/Kokoro from local resources (dev mode)', { sourceDir })
    this._progress.reportProgress('extracting', 0, 0)
    await cp(sourceDir, join(this._installRoot, 'sherpa'), { recursive: true })
  }

  private async installFromUrl(url: string): Promise<void> {
    const zipPath = join(this._installRoot, 'sherpa-kokoro.zip')
    try {
      this._logger.info('Downloading Sherpa/Kokoro asset', { url })
      await this.download(url, zipPath)

      this._logger.info('Extracting Sherpa/Kokoro asset', { zipPath })
      this._progress.reportProgress('extracting', 0, 0)
      await extract(zipPath, { dir: this._installRoot })
    } finally {
      await unlink(zipPath).catch(() => {})
    }
  }

  private async download(url: string, destPath: string): Promise<void> {
    const response = await fetch(url, { redirect: 'follow' })
    if (!response.ok || !response.body) {
      throw new Error(`Download failed: ${response.status} ${response.statusText}`)
    }

    const totalBytes = Number(response.headers.get('content-length') ?? 0)
    let received = 0

    const fileStream = createWriteStream(destPath)
    const reader = Readable.fromWeb(response.body as Parameters<typeof Readable.fromWeb>[0])

    reader.on('data', (chunk: Buffer) => {
      received += chunk.length
      this._progress.reportProgress('downloading', received, totalBytes)
    })

    await pipeline(reader, fileStream)
  }
}
