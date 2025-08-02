import { Reminder } from './Reminder'

export class ReminderService {
  public async getReminders(): Promise<Reminder[]> {
    return []
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async addReminder(reminder: Reminder): Promise<void> {
    return
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async removeReminder(id: string): Promise<void> {
    return
  }
}
