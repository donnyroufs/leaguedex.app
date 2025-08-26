import { GameEvent } from './game-events'
import { GameData } from './GameData'
import { GameObjectiveTracker } from './GameObjectiveTracker'
import { GameState } from './GameState'

export class GameStateAssembler {
  private _processedEvents = new Set<number>()
  private _lastGameState: GameState | null = null

  public assemble(data: GameData): GameState | null {
    if (data === null) {
      return null
    }

    const events = this.getAndTrackUnprocessedEvents(data)
    const objectives = GameObjectiveTracker.track(this._lastGameState?.objectives ?? null, data)

    return new GameState(
      data.gameTime,
      events,
      {
        summonerName: data.activePlayer.summonerName,
        isAlive: data.activePlayer.isAlive,
        respawnsIn: data.activePlayer.respawnsIn
      },
      objectives
    )
  }

  public reset(): void {
    this._processedEvents.clear()
    this._lastGameState = null
  }

  private getAndTrackUnprocessedEvents(data: GameData): GameEvent<unknown>[] {
    const evts = data.events.filter((evt) => !this._processedEvents.has(evt.id))
    evts.forEach((evt) => this._processedEvents.add(evt.id))
    return evts
  }
}
