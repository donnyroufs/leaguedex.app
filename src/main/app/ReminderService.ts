import { Reminder } from './Reminder'

export class ReminderService {
  // TODO: implement this
  // TODO: What about repeatable remidners?
  public async getReminders(): Promise<Reminder[]> {
    return [
      new Reminder(crypto.randomUUID(), 'Time to ward', 135, false),
      new Reminder(crypto.randomUUID(), 'Scuttle Crab', 210, false),
      new Reminder(crypto.randomUUID(), 'Gank Window', 160, false),
      new Reminder(crypto.randomUUID(), 'Gank Window', 225, false),
      new Reminder(crypto.randomUUID(), 'Next Jungle Rotation', 260, false)
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
