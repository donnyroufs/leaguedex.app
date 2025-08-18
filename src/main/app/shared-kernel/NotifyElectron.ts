import { BrowserWindow } from 'electron'
import { INotifyElectron } from './INotifyElectron'

export class NotifyElectron implements INotifyElectron {
  public notify<TData = unknown>(channel: string, data: TData): void {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send(channel, data)
    })
  }
}
