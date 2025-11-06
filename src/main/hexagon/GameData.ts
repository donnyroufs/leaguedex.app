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

  /**
   * In case the champion is not a mana champion, this will be null.
   */
  currentMana: number | null
  totalMana: number | null
  items: readonly number[]
}
