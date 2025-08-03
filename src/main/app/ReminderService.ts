import * as fs from 'fs/promises'
import * as path from 'path'
import { app } from 'electron'

import { OneTimeReminder, Reminder, RepeatingReminder } from './Reminder'

export class ReminderService {
  private readonly storagePath: string

  constructor() {
    this.storagePath = path.join(app.getPath('userData'), 'reminders.json')
  }

  public async getReminders(): Promise<Reminder[]> {
    const defaultReminders = [
      new OneTimeReminder(crypto.randomUUID(), 'Time to ward', 135),
      new OneTimeReminder(crypto.randomUUID(), 'Scuttle Crab', 210),
      new OneTimeReminder(crypto.randomUUID(), 'Gank Window', 160),
      new OneTimeReminder(crypto.randomUUID(), 'Gank Window', 225),
      new OneTimeReminder(crypto.randomUUID(), 'Next Jungle Rotation', 260),
      new OneTimeReminder(crypto.randomUUID(), 'Turret plates falling in 60 seconds', 780),
      new RepeatingReminder(crypto.randomUUID(), 'Check Map', 60)
    ]

    try {
      const data = await fs.readFile(this.storagePath, 'utf8')
      const savedReminders = JSON.parse(data)

      return savedReminders.map((r: OneTimeReminder | RepeatingReminder) => {
        if ('interval' in r && r.interval != null) {
          return new RepeatingReminder(r.id, r.message, r.interval)
        } else if ('triggerTime' in r && r.triggerTime != null) {
          return new OneTimeReminder(r.id, r.message, r.triggerTime)
        } else {
          throw new Error('Invalid reminder data')
        }
      })
    } catch {
      await this.saveReminders(defaultReminders)
      console.error('No reminders found, using default reminders')
      return defaultReminders
    }
  }

  public async addReminder(reminder: Reminder): Promise<void> {
    const reminders = await this.getReminders()
    reminders.push(reminder)
    await this.saveReminders(reminders)
  }

  public async removeReminder(id: string): Promise<void> {
    const reminders = await this.getReminders()
    const filteredReminders = reminders.filter((r) => r.id !== id)
    await this.saveReminders(filteredReminders)
  }

  private async saveReminders(reminders: Reminder[]): Promise<void> {
    const data = reminders.map((r) => ({
      id: r.id,
      message: r.message,
      type: r instanceof RepeatingReminder ? 'repeating' : 'one-time',
      interval: r instanceof RepeatingReminder ? r.interval : null,
      triggerTime: r instanceof OneTimeReminder ? r.triggerTime : null
    }))

    await fs.writeFile(this.storagePath, JSON.stringify(data, null, 2))
  }
}
