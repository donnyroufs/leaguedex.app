import { Champion } from './Champion'
import { MatchupNote } from './MatchupNote'

export type MatchupId = `${string}-vs-${string}`

export function createMatchupId(you: Champion, enemy: Champion): MatchupId {
  return `${you.name.toLowerCase()}-vs-${enemy.name.toLowerCase()}`
}

/**
 * A matchup is a pair of champions that are playing against each other.
 */
export type Matchup = {
  id: MatchupId
  you: Champion
  enemy: Champion
  notes: MatchupNote[]
}
