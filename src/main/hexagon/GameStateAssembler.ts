import { GameEvent } from './game-events'
import { GameData } from './GameData'
import { GameObjectiveTracker } from './GameObjectiveTracker'
import { GameState } from './GameState'

export class GameStateAssembler {
  private _processedEvents = new Set<number>()

  public assemble(data: GameData): GameState {
    const events = this.getAndTrackUnprocessedEvents(data)
    const objectives = GameObjectiveTracker.track(data)

    const state = new GameState(
      data.gameTime,
      events,
      {
        summonerName: data.activePlayer.summonerName,
        isAlive: data.activePlayer.isAlive,
        respawnsIn: data.activePlayer.respawnsIn,
        // TODO: pass data
        currentMana: null,
        totalMana: null
      },
      objectives
    )

    return state
  }

  private getAndTrackUnprocessedEvents(data: GameData): GameEvent<unknown>[] {
    const evts = data.events.filter((evt) => !this._processedEvents.has(evt.id))
    evts.forEach((evt) => this._processedEvents.add(evt.id))
    return evts
  }
}
