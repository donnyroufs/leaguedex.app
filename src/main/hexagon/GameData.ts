import { GameEvent } from './game-events'

/**
 * Data we mapped from the game into something consistent for our domain.
 */
export type GameData = {
  readonly hasStarted: boolean
  readonly gameTime: number
  readonly events: GameEvent<unknown>[]
  readonly activePlayer: RawActivePlayer
}

type RawActivePlayer = {
  summonerName: string
  isAlive: boolean
  respawnsIn: number | null
}
