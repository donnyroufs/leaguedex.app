import { BrowserWindow } from 'electron'
import { IAudioRegenerationProgressReporter } from '../../hexagon'

export class IpcAudioRegenerationProgressReporter implements IAudioRegenerationProgressReporter {
  public constructor(private readonly _window: BrowserWindow) {}

  public reportProgress(
    completedPacks: number,
    totalPacks: number,
    completedCues: number,
    totalUniqueCues: number
  ): void {
    this._window.webContents.send('regenerate-audio-progress', {
      completedPacks,
      totalPacks,
      completedCues,
      totalUniqueCues
    })
  }

  public reportComplete(): void {
    this._window.webContents.send('regenerate-audio-complete')
  }
}
