import { OneTimeReminder, Reminder, RepeatingReminder } from './Reminder'

export class ReminderService {
  // TODO: implement this
  public async getReminders(): Promise<Reminder[]> {
    return [
      new OneTimeReminder(crypto.randomUUID(), 'Time to ward', false, 135),
      new OneTimeReminder(crypto.randomUUID(), 'Scuttle Crab', false, 210),
      new OneTimeReminder(crypto.randomUUID(), 'Gank Window', false, 160),
      new OneTimeReminder(crypto.randomUUID(), 'Gank Window', false, 225),
      new OneTimeReminder(crypto.randomUUID(), 'Next Jungle Rotation', false, 260),
      new RepeatingReminder(crypto.randomUUID(), 'Check Map', false, 60)
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
