import { OneTimeReminder, Reminder, RepeatingReminder } from './Reminder'

// TODO: implement this
export class ReminderService {
  public async getReminders(): Promise<Reminder[]> {
    return [
      new OneTimeReminder(crypto.randomUUID(), 'Time to ward', 135),
      new OneTimeReminder(crypto.randomUUID(), 'Scuttle Crab', 210),
      new OneTimeReminder(crypto.randomUUID(), 'Gank Window', 160),
      new OneTimeReminder(crypto.randomUUID(), 'Gank Window', 225),
      new OneTimeReminder(crypto.randomUUID(), 'Next Jungle Rotation', 260),
      new RepeatingReminder(crypto.randomUUID(), 'Check Map', 60)
    ]
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async addReminder(_reminder: Reminder): Promise<void> {
    return
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async removeReminder(_id: string): Promise<void> {
    return
  }
}
