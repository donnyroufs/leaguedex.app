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

  public async dispose(): Promise<void> {
    this._timer.stop()
  }

  protected stop(): void {
    this._logger.info('GameMonitor stopped')
    this._recognizeGameStarted = false
    this._gameStateAssembler = new GameStateAssembler()
    this._lastTick = 0
    this._eventBus.publish('game-stopped', new GameStoppedEvent({}))
  }

  private async onStartTimer(): Promise<void> {
    const data = await this._gameDataProvider.getGameData()

    if (data.isErr()) {
      if (this._recognizeGameStarted) {
        this._logger.info('Game stopped', { lastTick: this._lastTick })
        this.stop()
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
      this._lastTick = gameData.gameTime - 1
      this._eventBus.publish('game-started', new GameStartedEvent({ gameTime: gameData.gameTime }))
      this._logger.info('Game started', { gameTime: gameData.gameTime })
    }

    const gapInfo = this.detectTickGap(gameData.gameTime)

    if (gapInfo.isPaused) {
      return
    }

    if (gapInfo.missedTicks.length > 0) {
      this._logger.warn(`Detected gap: missed ${gapInfo.missedTicks.length} tick(s)`, {
        lastTick: this._lastTick,
        currentTick: gameData.gameTime,
        missed: gapInfo.missedTicks
      })

      for (const missedTick of gapInfo.missedTicks) {
        const backfillState = this._gameStateAssembler.assemble({
          ...gameData,
          gameTime: missedTick
        })
        if (backfillState) {
          this.onPublishGameTick(backfillState)
        }
      }
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

  private detectTickGap(currentTick: number): { isPaused: boolean; missedTicks: number[] } {
    if (currentTick === this._lastTick) {
      return { isPaused: true, missedTicks: [] }
    }

    const missedTicks: number[] = []
    const gap = currentTick - this._lastTick - 1
    const maxBackfill = 10

    if (gap > 0) {
      const ticksToBackfill = Math.min(gap, maxBackfill)
      for (let i = 1; i <= ticksToBackfill; i++) {
        missedTicks.push(this._lastTick + i)
      }
    }

    return { isPaused: false, missedTicks }
  }
}
