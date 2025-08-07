import { readFile, writeFile } from 'fs/promises'
import { access, constants, writeFileSync } from 'fs'
import { OneTimeReminder, Reminder, RepeatingReminder } from './Reminder'

export class ReminderService {
  constructor(private readonly _storagePath: string) {}

  public async getReminders(): Promise<Reminder[]> {
    const data = await readFile(this._storagePath, 'utf8')
    const reminders = JSON.parse(data)
    return reminders.map(this.deserializeReminder)
  }

  public async addReminder(reminder: Reminder): Promise<void> {
    const reminders = await this.getReminders()
    reminders.push(reminder)
    await writeFile(this._storagePath, JSON.stringify(reminders))
  }

  public async removeReminder(id: string): Promise<void> {
    const reminders = await this.getReminders()
    const filteredReminders = reminders.filter((r) => r.id !== id)
    await writeFile(this._storagePath, JSON.stringify(filteredReminders))
  }

  /**
   * Ensures that the storage file exists.
   */
  public configure(): void {
    access(this._storagePath, constants.F_OK, (err) => {
      if (!err) {
        console.info(`Reminder storage file already exists at ${this._storagePath}.`)
        return
      }

      console.error(err)
      console.info(`Reminder storage file does not exist at ${this._storagePath}. Creating it...`)
      writeFileSync(this._storagePath, JSON.stringify([]))
      console.info(`Reminder storage file created at ${this._storagePath}.`)
    })
  }

  private deserializeReminder(reminder: Reminder): Reminder {
    if (RepeatingReminder.is(reminder)) {
      return new RepeatingReminder(reminder.id, reminder.message, reminder.interval)
    }

    if (OneTimeReminder.is(reminder)) {
      return new OneTimeReminder(reminder.id, reminder.message, reminder.triggerTime)
    }

    throw new Error('Invalid reminder data format')
  }
}
