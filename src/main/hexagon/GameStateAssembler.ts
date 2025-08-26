import { GameEvent } from './game-events'
import { GameData } from './GameData'
import { GameState } from './GameState'

export class GameStateAssembler {
  private _processedEvents = new Set<number>()

  public assemble(data: GameData): GameState | null {
    if (data === null) {
      return null
    }

    const events = this.getAndTrackUnprocessedEvents(data)

    return new GameState(data.gameTime, events, {
      summonerName: data.activePlayer.summonerName,
      isAlive: data.activePlayer.isAlive,
      respawnsIn: data.activePlayer.respawnsIn
    })
  }

  public reset(): void {
    this._processedEvents.clear()
  }

  private getAndTrackUnprocessedEvents(data: GameData): GameEvent<unknown>[] {
    const evts = data.events.filter((evt) => !this._processedEvents.has(evt.id))
    evts.forEach((evt) => this._processedEvents.add(evt.id))
    return evts
  }
}
