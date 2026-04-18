import { BrowserWindow } from 'electron'
import {
  IModelDownloadProgressReporter,
  ModelDownloadPhase
} from '../../hexagon/ports/IModelDownloadProgressReporter'

export class IpcModelDownloadProgressReporter implements IModelDownloadProgressReporter {
  public reportProgress(
    phase: ModelDownloadPhase,
    receivedBytes: number,
    totalBytes: number
  ): void {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send('model-download-progress', {
        phase,
        receivedBytes,
        totalBytes
      })
    })
  }

  public reportComplete(): void {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send('model-download-complete')
    })
  }

  public reportError(message: string): void {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send('model-download-error', { message })
    })
  }
}
