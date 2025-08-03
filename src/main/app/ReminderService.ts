import { OneTimeReminder, Reminder, RepeatingReminder } from './Reminder'
import { DebugLogger } from './DebugLogger'

export class ReminderService {
  // TODO: implement this
  public async getReminders(): Promise<Reminder[]> {
    DebugLogger.info('ReminderService.getReminders() called')
    const reminders = [
      new OneTimeReminder(crypto.randomUUID(), 'Time to ward', false, 135),
      new OneTimeReminder(crypto.randomUUID(), 'Scuttle Crab', false, 210),
      new OneTimeReminder(crypto.randomUUID(), 'Gank Window', false, 160),
      new OneTimeReminder(crypto.randomUUID(), 'Gank Window', false, 225),
      new OneTimeReminder(crypto.randomUUID(), 'Next Jungle Rotation', false, 260),
      new RepeatingReminder(crypto.randomUUID(), 'Check Map', false, 60)
    ]
    DebugLogger.log('ReminderService.getReminders() returning', reminders.length, 'reminders')
    return reminders
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async addReminder(reminder: Reminder): Promise<void> {
    DebugLogger.info('ReminderService.addReminder() called', {
      reminderId: reminder.id,
      message: reminder.message
    })
    return
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async removeReminder(id: string): Promise<void> {
    DebugLogger.info('ReminderService.removeReminder() called', { reminderId: id })
    return
  }
}
