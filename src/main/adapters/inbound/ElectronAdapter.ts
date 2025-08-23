import { type IpcMain } from 'electron'
import { App } from '../../Leaguedex'
import { CreateReminderDto } from '../../hexagon'

/**
 * Responsible for setting bindings between Electron and the App.
 */
export class ElectronAdapter {
  public static async setup(app: App, ipcMain: IpcMain): Promise<void> {
    ipcMain.handle('add-reminder', async (_, data: CreateReminderDto) => {
      return app.addReminder(data)
    })

    ipcMain.handle('get-reminders', async () => {
      return app.getReminders()
    })

    ipcMain.handle('remove-reminder', async (_, id: string) => {
      return app.removeReminder(id)
    })
  }
}
