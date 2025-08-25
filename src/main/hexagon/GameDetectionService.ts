import { IEventBus } from './ports/IEventBus'
import { GameTickEvent } from './events/GameTickEvent'
import { GameEndedEvent } from './events/GameEndedEvent'
import { GameStartedEvent } from './events/GameStartedEvent'
import { ITimer } from './ports/ITimer'
import { GameState } from './GameState'
import { ILogger } from './ports/ILogger'
import { GetGameStateResult, IGameDataProvider } from './ports/IGameDataProvider'

export class GameDetectionService {
  private _gameStarted = false

  public constructor(
    private readonly _eventBus: IEventBus,
    private readonly _gameDataProvider: IGameDataProvider,
    private readonly _timer: ITimer,
    private readonly _logger: ILogger
  ) {}

  public start(): void {
    this._timer.start(async () => {
      await this.processGameState()
    })
  }

  public stop(): void {
    this._timer.stop()
  }

  private async processGameState(): Promise<void> {
    try {
      const result = await this._gameDataProvider.getGameData()

      if (this.shouldSkipProcessing(result)) {
        return
      }

      if (this.shouldEndGame(result)) {
        this.endGame()
        return
      }

      if (this.shouldStartGame(result)) {
        this.startGame(result.getValue())
        return
      }

      if (this.shouldPublishGameTick(result)) {
        this.publishGameTick(result.getValue())
      }
    } catch (err) {
      this._logger.error('Failed to process game state', { error: err })
    }
  }

  private shouldSkipProcessing(result: GetGameStateResult): boolean {
    return !this._gameStarted && result.isErr()
  }

  private shouldEndGame(result: GetGameStateResult): boolean {
    return this._gameStarted && result.isErr()
  }

  private shouldStartGame(result: GetGameStateResult): boolean {
    return (
      !this._gameStarted &&
      result.isOk() &&
      result.getValue().events.some((x) => x.eventType === 'game-started')
    )
  }

  private shouldPublishGameTick(result: GetGameStateResult): boolean {
    return this._gameStarted && result.isOk()
  }

  private endGame(): void {
    this._eventBus.publish('game-ended', new GameEndedEvent(this.createEventId(), null))
    this._gameStarted = false
  }

  private startGame(gameState: GameState): void {
    this._gameStarted = true

    if (gameState.gameTime === 0) {
      this._eventBus.publish(
        'game-started',
        new GameStartedEvent(this.createEventId(), { gameTime: 0 })
      )
    } else {
      this.publishGameTick(gameState)
    }
  }

  private publishGameTick(gameState: GameState): void {
    this._eventBus.publish(
      'game-tick',
      new GameTickEvent(this.createEventId(), {
        state: gameState
      })
    )
  }

  private createEventId(): number {
    return Date.now() + Math.floor(Math.random() * 1000)
  }
}
