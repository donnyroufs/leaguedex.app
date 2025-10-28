import { IEventBus } from './ports/IEventBus'
import { IGameDataProvider } from './ports/IGameDataProvider'
import { ILogger } from './ports/ILogger'
import { ITimer } from './ports/ITimer'
import { GameStartedEvent, GameStoppedEvent, GameTickEvent } from './domain-events'
import { GameState } from './GameState'
import { GameStateAssembler } from './GameStateAssembler'

export class GameMonitor {
  private _recognizeGameStarted = false
  private _lastTick = 0
  private _gameStateAssembler = new GameStateAssembler()

  public constructor(
    private readonly _logger: ILogger,
    private readonly _timer: ITimer,
    private readonly _eventBus: IEventBus,
    private readonly _gameDataProvider: IGameDataProvider
  ) {}

  public async start(): Promise<void> {
    this._logger.info('GameMonitor started')
    this._timer.start(this.onStartTimer.bind(this))
  }

  public async stop(): Promise<void> {
    this._logger.info('GameMonitor stopped')
    this._recognizeGameStarted = false
    this._timer.stop()
    this._gameStateAssembler = new GameStateAssembler()
    this._lastTick = 0
    this._eventBus.publish('game-stopped', new GameStoppedEvent({}))
  }

  private async onStartTimer(): Promise<void> {
    const data = await this._gameDataProvider.getGameData()

    if (data.isErr()) {
      if (this._recognizeGameStarted) {
        this._logger.info('Game stopped', { lastTick: this._lastTick })
        await this.stop()
      }

      return
    }

    const hasStarted = data.getValue() !== null

    if (!hasStarted) {
      return
    }

    const gameData = data.getValue()!

    if (hasStarted && !this._recognizeGameStarted) {
      this._recognizeGameStarted = true
      this._eventBus.publish('game-started', new GameStartedEvent({ gameTime: gameData.gameTime }))
      this._logger.info('Game started', { gameTime: gameData.gameTime })
    }

    if (this.isGamePaused(gameData.gameTime)) {
      return
    }

    const currentGameState = this._gameStateAssembler.assemble(gameData)

    if (currentGameState) {
      this.onPublishGameTick(currentGameState)
    }
  }

  private onPublishGameTick(state: GameState): void {
    const evt = new GameTickEvent({ state })
    this._eventBus.publish(evt.eventType, evt)
    this._lastTick = state.gameTime
  }

  private isGamePaused(currentTick: number): boolean {
    return currentTick === this._lastTick
  }
}
