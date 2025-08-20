import { Result } from '../../../shared-kernel'
import { IReminderRepository, Reminder } from '../../../hexagon'

export class FakeReminderRepository implements IReminderRepository {
  private readonly _reminders: Map<string, Reminder> = new Map()

  public async save(reminder: Reminder): Promise<Result<void, Error>> {
    try {
      this._reminders.set(reminder.id, reminder)
      return Result.ok(undefined)
    } catch (error) {
      return Result.err(error as Error)
    }
  }

  public async all(): Promise<Result<Reminder[], Error>> {
    return Result.ok(Array.from(this._reminders.values()))
  }

  public clear(): void {
    this._reminders.clear()
  }
}
