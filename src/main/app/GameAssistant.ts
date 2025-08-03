import { GameDetector } from './GameDetector'
import { Contract, IDispatcher } from './IDispatcher'
import { IRiotClient } from './IRiotClient'
import { OneTimeReminder, Reminder } from './Reminder'
import { ReminderProcessor } from './ReminderProcessor'
import { ReminderScheduler } from './ReminderScheduler'
import { ReminderService } from './ReminderService'

export class GameAssistant {
  private _isPlaying = false
  private _assistantActive = false
  private _scheduledReminders: Reminder[] = []

  public constructor(
    private readonly _gameDetector: GameDetector,
    private readonly _dispatcher: IDispatcher,
    private readonly _reminderService: ReminderService,
    private readonly _riotClient: IRiotClient,
    private readonly _reminderProcessor: ReminderProcessor
  ) {}

  public start(): void {
    setInterval(async () => {
      const gameTime = await this._gameDetector.detect()
      this._isPlaying = gameTime !== null

      if (this._isPlaying && !this._assistantActive) {
        this.activate()
      } else if (!this._isPlaying && this._assistantActive) {
        this.deactivate()
      }

      if (this._assistantActive && gameTime !== null) {
        this.processScheduledReminders(gameTime)
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
    this._dispatcher.subscribe(name, callback)
    return this
  }

  private async activate(): Promise<void> {
    console.log('Game Assistant activated')

    // TODO: handle error with client
    const gameEvents = await this._riotClient.getGameEvents()
    const userReminders = await this._reminderService.getReminders()
    this._scheduledReminders = ReminderScheduler.schedule(gameEvents, userReminders)

    this._assistantActive = true
  }

  private deactivate(): void {
    console.log('Game Assistant deactivated')
    this._assistantActive = false
    this._scheduledReminders = []
  }

  private processScheduledReminders(currentGameTime: number): void {
    const remindersToTrigger = this._scheduledReminders.filter((reminder) => {
      if (reminder instanceof OneTimeReminder) {
        return reminder.triggerTime === currentGameTime
      }
      return false
    })

    if (remindersToTrigger.length === 0) {
      return
    }

    this._reminderProcessor.process(remindersToTrigger)

    this._scheduledReminders = this._scheduledReminders.filter(
      (r) => !remindersToTrigger.some((triggered) => triggered.id === r.id)
    )
  }
}
