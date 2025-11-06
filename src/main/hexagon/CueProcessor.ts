import { Cue } from './Cue'
import { IAudioPlayer } from './ports/IAudioPlayer'
import { ILogger } from './ports/ILogger'
import { IUserSettingsRepository } from './ports/IUserSettingsRepository'

export class CueProcessor {
  private _queue: Cue[] = []
  private _isProcessing = false
  private _shouldStop = false

  public constructor(
    private readonly _audioPlayer: IAudioPlayer,
    private readonly _logger: ILogger,
    private readonly _userSettingsRepository: IUserSettingsRepository,
    private readonly _audioDir: string
  ) {}

  public enqueue(cue: Cue): void {
    this._queue.push(cue)
    this.processQueue()
  }

  private async processQueue(): Promise<void> {
    if (this._isProcessing) return

    this._isProcessing = true

    while (this._queue.length > 0 && !this._shouldStop) {
      const cue = this._queue.shift()!

      const settings = await this._userSettingsRepository.load()

      if (settings.isErr()) {
        this._logger.error('Failed to load user settings', { error: settings.getError() })
        continue
      }

      const result = await this._audioPlayer.play(
        cue.audioUrl.fullPath(this._audioDir),
        settings.getValue().volume
      )

      if (result.isErr()) {
        this._logger.error('Audio playback failed', { cueId: cue.id, error: result.getError() })
      }
    }

    this._isProcessing = false
    this._shouldStop = false
  }

  public clear(): void {
    this._shouldStop = true
    this._queue = []
  }
}
