export type ActivePlayer = {
  summonerName: string
  isAlive: boolean
  respawnsIn: number | null

  /**
   * In case the champion is not a mana champion, this will be null.
   */
  currentMana: number | null
  totalMana: number | null
}
