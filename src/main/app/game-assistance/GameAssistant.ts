import { createInsightsService } from '..'
import { GameObject } from '../Game'
import { GameService } from '../GameService'
import { InsightsService } from '../InsightsService'
import { MatchupService } from '../MatchupService'
import { UserConfig, UserConfigRepository } from '../UserConfig'
import { GameDetected, GameDetector } from './GameDetector'
import { Contract, IDispatcher } from './IDispatcher'
import { IRiotClient } from './IRiotClient'
import { OneTimeReminder, Reminder, RepeatingReminder } from './Reminder'
import { ReminderOrchestrator } from './ReminderOrchestrator'
import { ReminderService } from './ReminderService'

export type CreateReminder = {
  message: string
  time: number
  type: 'one-time' | 'repeating'
}

export class GameAssistant {
  private _isPlaying = false
  private _assistantActive = false
  private _currentGameId: string | null = null
  private _insightsService: InsightsService | null = null
  private _generatedInsights: string | null = null
  private _processingInsights = false

  public constructor(
    private readonly _gameDetector: GameDetector,
    private readonly _dispatcher: IDispatcher,
    private readonly _riotClient: IRiotClient,
    private readonly _reminderOrchestrator: ReminderOrchestrator,
    private readonly _reminderService: ReminderService,
    private readonly _configRepository: UserConfigRepository,
    private readonly _gameService: GameService
  ) {}

  /* I think these methods shouldn't be exposed like this. */
  public getReminders(): Promise<Reminder[]> {
    return this._reminderService.getReminders()
  }

  public removeReminder(id: string): Promise<void> {
    return this._reminderService.removeReminder(id)
  }

  // shouldnt be part of game assistant
  public getAllGames(): Promise<GameObject[]> {
    return this._gameService.getAllGames()
  }

  public async reviewGame(gameId: string, notes: string): Promise<void> {
    return this._gameService.review(gameId, notes)
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
        await this.activate(gameState)
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

      const matchup = gameState.data != null ? MatchupService.getMatchup(gameState.data) : null

      let insights: string | null = null

      if (matchup != null && !this._processingInsights) {
        this._processingInsights = true

        insights =
          (await this._insightsService?.generateInsights(
            MatchupService.getMatchup(gameState.data!)!.id
          )) ?? null
        this._generatedInsights = insights
      }

      this._dispatcher.dispatch('game-data', {
        playing: this._isPlaying,
        gameTime: gameState.time,
        matchup,
        insights: this._generatedInsights
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

  private async activate(gameState: GameDetected): Promise<void> {
    console.log('Game Assistant activated')
    const config = this._configRepository.getConfig()
    await this._reminderOrchestrator.initialize(
      gameState.time!,
      config.gameAssistance.enableNeutralObjectiveTimers
    )
    this._currentGameId = await this._gameService.createGame(gameState.data!)
    this._insightsService = createInsightsService(
      config.insights.ai.enabled,
      config.insights.ai.apiKey,
      this._gameService
    )
    this._assistantActive = true
  }

  private deactivate(): void {
    console.log('Game Assistant deactivated')
    if (this._currentGameId) {
      this._gameService.complete(this._currentGameId)
    }
    this._reminderOrchestrator.reset()
    this._assistantActive = false
    this._currentGameId = null
    this._insightsService = null
    this._processingInsights = false
    this._generatedInsights = null
  }
}
