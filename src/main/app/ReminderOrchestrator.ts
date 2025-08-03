import { NormalizedGameEvent } from './IRiotClient'
import { ObjectiveTracker } from './ObjectiveTracker'
import { Reminder } from './Reminder'
import { ReminderProcessor } from './ReminderProcessor'
import { ReminderScheduler } from './ReminderScheduler'
import { ReminderService } from './ReminderService'
import { Seconds } from './types'

export class ReminderOrchestrator {
  private _reminders: Reminder[] = []

  public constructor(
    private readonly _reminderService: ReminderService,
    private readonly _reminderProcessor: ReminderProcessor,
    private readonly _objectiveTracker: ObjectiveTracker
  ) {}

  public async initialize(gameTime: Seconds): Promise<void> {
    const userReminders = await this._reminderService.getReminders()
    const initialReminders = ReminderScheduler.schedule(userReminders, gameTime)
    this._reminders.push(...initialReminders)
  }

  public processTick(gameTime: Seconds, gameEvents: NormalizedGameEvent[]): void {
    const objectiveReminders = this._objectiveTracker.track(gameEvents, gameTime)
    this._reminders.push(...objectiveReminders)

    const remindersToTrigger = this._reminders.filter((x) => x.triggerTime === gameTime)

    if (remindersToTrigger.length > 0) {
      this._reminderProcessor.process(remindersToTrigger)
    }

    this._reminders = this._reminders.filter((x) => x.triggerTime !== gameTime)
  }

  public reset(): void {
    this._reminders = []
  }
}
