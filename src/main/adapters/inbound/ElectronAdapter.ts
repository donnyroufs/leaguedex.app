import { BrowserWindow, type IpcMain } from 'electron'
import { CreateReminderDto } from '../../hexagon'
import { IAppController } from '../../hexagon/ports/IAppController'

/**
 * Responsible for setting bindings between Electron and the App.
 */
export class ElectronAdapter {
  private _configured: boolean = false

  public constructor(private readonly _appController: IAppController) {}

  public async setup(ipcMain: IpcMain): Promise<void> {
    if (this._configured) {
      return
    }

    ipcMain.handle('add-reminder', async (_, data: CreateReminderDto) => {
      return this._appController.addReminder(data)
    })

    ipcMain.handle('get-reminders', async () => {
      return this._appController.getReminders()
    })

    ipcMain.handle('remove-reminder', async (_, id: string) => {
      return this._appController.removeReminder(id)
    })

    ipcMain.handle('update-license', async (_, key: string) => {
      return this._appController.updateLicense(key)
    })

    ipcMain.handle('get-license', async () => {
      return this._appController.getLicense()
    })

    this._appController.onGameTick((evt) => {
      BrowserWindow.getAllWindows().forEach((window) => {
        window.webContents.send('game-data', evt)
      })
    })

    this._appController.onGameStarted((evt) => {
      BrowserWindow.getAllWindows().forEach((window) => {
        window.webContents.send('game-data', evt)
      })
    })

    this._appController.onGameStopped((evt) => {
      BrowserWindow.getAllWindows().forEach((window) => {
        window.webContents.send('game-data', evt)
      })
    })

    this._configured = true
  }
}
