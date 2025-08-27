import { GameEvent } from './game-events'

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
