import { GameDetector } from './GameDetector'
import { Contract, IDispatcher } from './IDispatcher'
import { IRiotClient } from './IRiotClient'
import { ITextToSpeech } from './ITextToSpeech'
import { OneTimeReminder, Reminder } from './Reminder'
import { ReminderScheduler } from './ReminderScheduler'
import { ReminderService } from './ReminderService'
import { DebugLogger } from './DebugLogger'

export class GameAssistant {
  private _isPlaying = false
  private _assistantActive = false
  private _scheduledReminders: Reminder[] = []

  public constructor(
    private readonly _gameDetector: GameDetector,
    private readonly _dispatcher: IDispatcher,
    private readonly _reminderService: ReminderService,
    private readonly _riotClient: IRiotClient,
    private readonly _textToSpeech: ITextToSpeech
  ) {
    DebugLogger.info('GameAssistant constructor called')
  }

  public start(): void {
    DebugLogger.info('GameAssistant.start() called')
    setInterval(async () => {
      const gameTime = await this._gameDetector.detect()
      const wasPlaying = this._isPlaying
      this._isPlaying = gameTime !== null

      if (this._isPlaying && !this._assistantActive) {
        DebugLogger.log('Game detected, activating assistant', { gameTime })
        this.activate()
      } else if (!this._isPlaying && this._assistantActive) {
        DebugLogger.log('Game ended, deactivating assistant')
        this.deactivate()
      }

      if (this._assistantActive && gameTime !== null) {
        this.processScheduledReminders(gameTime)
      }

      if (wasPlaying !== this._isPlaying) {
        DebugLogger.log('Game state changed', {
          wasPlaying,
          isPlaying: this._isPlaying,
          gameTime
        })
      }

      this._dispatcher.dispatch('game-data', {
        playing: this._isPlaying,
        gameTime: gameTime
      })
    }, 1000)
  }

  public on<TName extends keyof Contract>(
    name: TName,
    callback: (data: Contract[TName]) => void
  ): this {
    DebugLogger.log('GameAssistant.on() called', { eventName: name })
    this._dispatcher.subscribe(name, callback)
    return this
  }

  private async activate(): Promise<void> {
    DebugLogger.info('GameAssistant.activate() called')
    console.log('Game Assistant activated')

    try {
      // TODO: handle error with client
      const gameEvents = await this._riotClient.getGameEvents()
      DebugLogger.log('Retrieved game events', { gameEventsCount: gameEvents.length })

      const userReminders = await this._reminderService.getReminders()
      DebugLogger.log('Retrieved user reminders', { userRemindersCount: userReminders.length })

      this._scheduledReminders = ReminderScheduler.schedule(gameEvents, userReminders)
      DebugLogger.log('Scheduled reminders', { scheduledCount: this._scheduledReminders.length })

      this._assistantActive = true
      DebugLogger.info('GameAssistant activated successfully')
    } catch (error) {
      DebugLogger.error('Failed to activate GameAssistant', error)
      throw error
    }
  }

  private deactivate(): void {
    DebugLogger.info('GameAssistant.deactivate() called')
    console.log('Game Assistant deactivated')
    this._assistantActive = false
    this._scheduledReminders = []
    DebugLogger.log('GameAssistant deactivated, cleared scheduled reminders')
  }

  private processScheduledReminders(currentGameTime: number): void {
    const remindersToTrigger = this._scheduledReminders.filter((reminder) => {
      if (reminder instanceof OneTimeReminder) {
        const shouldTrigger = reminder.triggerTime === currentGameTime
        if (shouldTrigger) {
          DebugLogger.log('Reminder should trigger', {
            reminderId: reminder.id,
            message: reminder.message,
            triggerTime: reminder.triggerTime,
            currentGameTime
          })
        }
        return shouldTrigger
      }

      return false
    })

    if (remindersToTrigger.length > 0) {
      DebugLogger.log('Processing reminders to trigger', { count: remindersToTrigger.length })
    }

    remindersToTrigger.forEach((reminder) => {
      this.triggerReminder(reminder)
      this._scheduledReminders = this._scheduledReminders.filter((r) => r.id !== reminder.id)
      DebugLogger.log('Removed triggered reminder from scheduled list', { reminderId: reminder.id })
    })
  }

  private triggerReminder(reminder: Reminder): void {
    DebugLogger.info('Triggering reminder', {
      reminderId: reminder.id,
      message: reminder.message
    })

    this._textToSpeech.speak(reminder.message)

    this._dispatcher.dispatch('reminder-triggered', {
      id: reminder.id,
      message: reminder.message
    })

    DebugLogger.log('Reminder triggered and dispatched', { reminderId: reminder.id })
  }
}
