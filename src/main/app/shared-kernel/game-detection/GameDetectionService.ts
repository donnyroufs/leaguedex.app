import { GameEndedEvent, GameStartedEvent, GameTickEvent, IEventBus } from '../EventBus'
import { RiotApi } from '../riot-api/RiotApi'
import { ITimer } from '../ITimer'
import { GameState } from './GameState'
import { GetGameStateResult } from '../riot-api/RiotApi'
import { ILogger } from '../ILogger'

export class GameDetectionService {
  private _internalEventIdCounter = 10_000
  private _gameStarted = false

  public constructor(
    private readonly _eventBus: IEventBus,
    private readonly _riotApi: RiotApi,
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
      const result = await this._riotApi.getGameState()

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
    return !this._gameStarted && result.isOk()
  }

  private shouldPublishGameTick(result: GetGameStateResult): boolean {
    return this._gameStarted && result.isOk()
  }

  private endGame(): void {
    this._eventBus.publish('game-ended', new GameEndedEvent(++this._internalEventIdCounter, null))
    this._gameStarted = false
  }

  private startGame(gameState: GameState): void {
    this._gameStarted = true

    if (gameState.gameTime === 0) {
      this._eventBus.publish(
        'game-started',
        new GameStartedEvent(++this._internalEventIdCounter, { gameTime: 0 })
      )
    } else {
      this._eventBus.publish(
        'game-tick',
        new GameTickEvent(++this._internalEventIdCounter, {
          gameTime: gameState.gameTime
        })
      )
    }
  }

  private publishGameTick(gameState: GameState): void {
    this._eventBus.publish(
      'game-tick',
      new GameTickEvent(++this._internalEventIdCounter, {
        gameTime: gameState.gameTime
      })
    )
  }
}
