import { EventKey, EventMap, GameEndedEvent, GameTickEvent, IEventBus } from '../EventBus'
import { RiotApi } from '../riot-api'
import { ITimer } from '../ITimer'
import { GameState } from './GameState'

export class GameDetectionService {
  private _processedEvents: Set<number> = new Set()
  private _internalEventIdCounter = 10_000
  private _gameStarted = false

  public constructor(
    private readonly _eventBus: IEventBus,
    private readonly _riotApi: RiotApi,
    private readonly _timer: ITimer
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

      if (!this._gameStarted && result.isErr()) {
        return
      }

      if (this._gameStarted && result.isErr()) {
        this._eventBus.publish(
          'game-ended',
          new GameEndedEvent(++this._internalEventIdCounter, null)
        )
        this._gameStarted = false
        return
      }

      if (!this._gameStarted && result.isOk()) {
        this._gameStarted = true
      }

      const gameState = result.getValue()
      const unprocessedEvents = gameState.events.filter((evt) => !this._processedEvents.has(evt.id))

      const BUFFER = 3

      const isFirstTickWithMultipleEvents =
        this._processedEvents.size === 0 &&
        unprocessedEvents.length > 1 &&
        gameState.gameTime > BUFFER

      // We don't know the exact time the game started (in real time), so we ignore past events and continue from now on;
      // Later we can utilize the spectator API to get the exact time the game started but for now it's not worth the effort.
      if (!isFirstTickWithMultipleEvents) {
        unprocessedEvents.forEach((event) => {
          this._eventBus.publish(event.eventType, event as EventMap[EventKey])
          this._processedEvents.add(event.id)
        })
      }

      this.publishNextTick(gameState)
    } catch (err) {
      console.error(err)
    }
  }

  private publishNextTick(gameState: GameState): void {
    this._eventBus.publish(
      'game-tick',
      new GameTickEvent(++this._internalEventIdCounter, {
        gameTime: gameState.gameTime
      })
    )
  }
}
