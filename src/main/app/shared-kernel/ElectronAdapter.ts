import type { IpcMain } from 'electron'
import { App } from '../../app/App'
import { CreateReminderDto } from '../coaching'

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

    console.log('setup')
  }
}
