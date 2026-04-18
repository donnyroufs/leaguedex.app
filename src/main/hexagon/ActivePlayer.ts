import { Team } from './Team'

export type ActivePlayer = {
  summonerName: string
  isAlive: boolean
  respawnsIn: number | null

  /**
   * In case the champion is not a mana champion, this will be null.
   */
  currentMana: number | null
  totalMana: number | null
  /**
   * Derived: currentMana / totalMana * 100. Null if champion has no mana.
   */
  manaPercent: number | null
  currentGold: number
  items: readonly number[]
  team: Team
}
