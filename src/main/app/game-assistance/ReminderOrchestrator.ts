import { Logger } from '../shared-kernel'
import { NormalizedGameEvent } from './IRiotClient'
import { ObjectiveTracker } from './ObjectiveTracker'
import { OneTimeReminder, Reminder, RepeatingReminder } from './Reminder'
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

  public async initialize(gameTime: Seconds, enableNeutralObjectiveTimers: boolean): Promise<void> {
    const userReminders = await this._reminderService.getReminders()

    if (!enableNeutralObjectiveTimers) {
      this._reminders = userReminders
      return
    }

    const initialReminders = ReminderScheduler.schedule(userReminders, gameTime)
    this._reminders.push(...initialReminders)
  }

  public processTick(
    gameTime: Seconds,
    gameEvents: NormalizedGameEvent[],
    enableNeutralObjectiveTimers: boolean
  ): void {
    if (enableNeutralObjectiveTimers) {
      const objectiveReminders = this._objectiveTracker.track(gameEvents, gameTime)
      this._reminders.push(...objectiveReminders)
      if (objectiveReminders.length > 0) {
        Logger.log(`Processing ${objectiveReminders.length} objective reminders`, {
          objectiveReminders,
          gameTime,
          gameEvents
        })
      }
    }

    const oneTimeReminders = this._reminders.filter(
      (x) => x instanceof OneTimeReminder && x.triggerTime === gameTime
    )

    if (oneTimeReminders.length > 0) {
      this._reminderProcessor.process(oneTimeReminders)
      this._reminders = this._reminders.filter((x) => !oneTimeReminders.some((r) => r.id === x.id))
      Logger.log(`Processing ${oneTimeReminders.length} one-time reminders`, {
        oneTimeReminders,
        gameTime
      })
    }

    const repeatingReminders = this._reminders.filter(
      (x) => x instanceof RepeatingReminder && gameTime % x.interval === 0
    )

    if (repeatingReminders.length > 0) {
      Logger.log(`Processing ${repeatingReminders.length} repeating reminders`, {
        repeatingReminders,
        gameTime
      })
      this._reminderProcessor.process(repeatingReminders)
    }
  }

  public reset(): void {
    this._reminders = []
  }
}
