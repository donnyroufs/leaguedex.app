import { GameDetector } from './GameDetector'
import { Contract, IDispatcher } from './IDispatcher'
import { IRiotClient } from './IRiotClient'
import { OneTimeReminder, Reminder, RepeatingReminder } from './Reminder'
import { ReminderOrchestrator } from './ReminderOrchestrator'
import { ReminderService } from './ReminderService'
import { Seconds } from './types'

export class GameAssistant {
  private _isPlaying = false
  private _assistantActive = false

  public constructor(
    private readonly _gameDetector: GameDetector,
    private readonly _dispatcher: IDispatcher,
    private readonly _riotClient: IRiotClient,
    private readonly _reminderOrchestrator: ReminderOrchestrator,
    private readonly _reminderService: ReminderService
  ) {}

  /* I think these methods shouldn't be exposed like this. */
  public getReminders(): Promise<Reminder[]> {
    return this._reminderService.getReminders()
  }

  public removeReminder(id: string): Promise<void> {
    return this._reminderService.removeReminder(id)
  }

  public async addReminder(
    reminder: Omit<OneTimeReminder, 'id'> | Omit<RepeatingReminder, 'id'>
  ): Promise<void> {
    const id = crypto.randomUUID()

    try {
      if ('triggerTime' in reminder) {
        await this._reminderService.addReminder(
          new OneTimeReminder(id, reminder.message, reminder.triggerTime)
        )
      } else if ('interval' in reminder) {
        await this._reminderService.addReminder(
          new RepeatingReminder(id, reminder.message, reminder.interval)
        )
      }
    } catch (err) {
      console.error(err)
      throw new Error('Failed to add reminder')
    }
  }
  /* end */

  public start(): void {
    setInterval(async () => {
      const gameState = await this._gameDetector.detect()
      this._isPlaying = gameState.type === 'in-game'

      if (this._isPlaying && !this._assistantActive) {
        await this.activate(gameState.time!)
      } else if (!this._isPlaying && this._assistantActive) {
        this.deactivate()
      }

      if (this._assistantActive && gameState.time !== null) {
        const gameEvents = await this._riotClient.getGameEvents()
        this._reminderOrchestrator.processTick(gameState.time, gameEvents)
      }

      this._dispatcher.dispatch('game-data', {
        playing: this._isPlaying,
        gameTime: gameState.time
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

  private async activate(gameTime: Seconds): Promise<void> {
    console.log('Game Assistant activated')
    await this._reminderOrchestrator.initialize(gameTime)
    this._assistantActive = true
  }

  private deactivate(): void {
    console.log('Game Assistant deactivated')
    this._reminderOrchestrator.reset()
    this._assistantActive = false
  }
}
