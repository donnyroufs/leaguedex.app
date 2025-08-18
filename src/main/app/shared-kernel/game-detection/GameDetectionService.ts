import { GameEndedEvent, GameStartedEvent, GameTickEvent, IEventBus } from '../EventBus'
import { GameState } from './GameState'
import { RiotApi } from '../riot-api'
import { ITimer } from '../ITimer'

export class GameDetectionService {
  private _inGame: boolean = false
  private _gameTick: number = 0

  public constructor(
    private readonly _eventBus: IEventBus,
    private readonly _riotApi: RiotApi,
    private readonly _timer: ITimer
  ) {}

  public start(): void {
    this._timer.start(async () => {
      await this.pollGameState()
    })
  }

  public stop(): void {
    this._timer.stop()
  }

  private async pollGameState(): Promise<void> {
    try {
      const result = await this._riotApi.getGameState()

      if (result.isErr()) {
        this.handleGameEnded()
        return
      }

      const gameState = result.unwrap()
      this._gameTick = gameState.gameTick

      if (gameState.gameTick === 0 && this._inGame) {
        this.handleGameEnded()
      } else if (gameState.gameTick > 0 && !this._inGame) {
        this.handleGameStarted(gameState)
      } else if (gameState.gameTick > 0 && this._inGame) {
        this.handleGameTick(gameState)
      }
    } catch (err) {
      console.error(err)
    }
  }

  private handleGameEnded(): void {
    if (!this._inGame) return

    this._eventBus.publish('game-ended', new GameEndedEvent(this._gameTick, null))
    this._inGame = false
    this._gameTick = 0
  }

  private handleGameStarted(gameState: GameState): void {
    this._inGame = true
    this._eventBus.publish('game-started', new GameStartedEvent(this._gameTick, gameState))
  }

  private handleGameTick(gameState: GameState): void {
    this._eventBus.publish('game-tick', new GameTickEvent(this._gameTick, gameState))
  }
}
