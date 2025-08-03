import { GameDetector } from './GameDetector'
import { Contract, IDispatcher } from './IDispatcher'
import { IRiotClient } from './IRiotClient'
import { Reminder } from './Reminder'
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

  public getReminders(): Promise<Reminder[]> {
    return this._reminderService.getReminders()
  }

  public start(): void {
    setInterval(async () => {
      const gameTime = await this._gameDetector.detect()
      this._isPlaying = gameTime !== null

      if (this._isPlaying && !this._assistantActive) {
        await this.activate(gameTime!)
      } else if (!this._isPlaying && this._assistantActive) {
        this.deactivate()
      }

      if (this._assistantActive && gameTime !== null) {
        const gameEvents = await this._riotClient.getGameEvents()
        this._reminderOrchestrator.processTick(gameTime, gameEvents)
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
