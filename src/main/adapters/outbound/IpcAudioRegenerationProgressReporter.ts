import { BrowserWindow } from 'electron'
import { IAudioRegenerationProgressReporter } from '../../hexagon'

export class IpcAudioRegenerationProgressReporter implements IAudioRegenerationProgressReporter {
  public reportProgress(
    completedPacks: number,
    totalPacks: number,
    completedCues: number,
    totalUniqueCues: number
  ): void {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send('regenerate-audio-progress', {
        completedPacks,
        totalPacks,
        completedCues,
        totalUniqueCues
      })
    })
  }

  public reportComplete(): void {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send('regenerate-audio-complete')
    })
  }
}
