import { MatchupService } from '../MatchupService'
import { UserConfig, UserConfigRepository } from '../UserConfig'
import { GameDetector } from './GameDetector'
import { Contract, IDispatcher } from './IDispatcher'
import { IRiotClient } from './IRiotClient'
import { OneTimeReminder, Reminder, RepeatingReminder } from './Reminder'
import { ReminderOrchestrator } from './ReminderOrchestrator'
import { ReminderService } from './ReminderService'
import { Seconds } from './types'

export type CreateReminder = {
  message: string
  time: number
  type: 'one-time' | 'repeating'
}

export class GameAssistant {
  private _isPlaying = false
  private _assistantActive = false

  public constructor(
    private readonly _gameDetector: GameDetector,
    private readonly _dispatcher: IDispatcher,
    private readonly _riotClient: IRiotClient,
    private readonly _reminderOrchestrator: ReminderOrchestrator,
    private readonly _reminderService: ReminderService,
    private readonly _configRepository: UserConfigRepository
  ) {}

  /* I think these methods shouldn't be exposed like this. */
  public getReminders(): Promise<Reminder[]> {
    return this._reminderService.getReminders()
  }

  public removeReminder(id: string): Promise<void> {
    return this._reminderService.removeReminder(id)
  }

  public async addReminder(data: CreateReminder): Promise<void> {
    const id = crypto.randomUUID()

    try {
      // TODO: I think that we can use just 1 Reminder class and use a type field? These classes dont have any logic anyway.
      if (data.type === 'one-time') {
        await this._reminderService.addReminder(new OneTimeReminder(id, data.message, data.time))
      } else if (data.type === 'repeating') {
        await this._reminderService.addReminder(new RepeatingReminder(id, data.message, data.time))
      } else {
        throw new Error('Invalid reminder type')
      }
    } catch (err) {
      console.error(err)
      throw err
    }
  }
  /* end */

  public start(): void {
    let config: UserConfig

    setInterval(async () => {
      const gameState = await this._gameDetector.detect()

      this._isPlaying = gameState.type === 'in-game'

      if (this._isPlaying && !this._assistantActive) {
        config = this._configRepository.getConfig()
        await this.activate(gameState.time!)
      } else if (!this._isPlaying && this._assistantActive) {
        this.deactivate()
      }

      if (this._assistantActive && gameState.time !== null) {
        const gameEvents = await this._riotClient.getGameEvents()
        this._reminderOrchestrator.processTick(
          gameState.time,
          gameEvents,
          config.gameAssistance.enableNeutralObjectiveTimers
        )
      }

      this._dispatcher.dispatch('game-data', {
        playing: this._isPlaying,
        gameTime: gameState.time,
        matchup: gameState.data != null ? MatchupService.getMatchup(gameState.data) : null
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
    const config = this._configRepository.getConfig()
    await this._reminderOrchestrator.initialize(
      gameTime,
      config.gameAssistance.enableNeutralObjectiveTimers
    )
    this._assistantActive = true
  }

  private deactivate(): void {
    console.log('Game Assistant deactivated')
    this._reminderOrchestrator.reset()
    this._assistantActive = false
  }
}
