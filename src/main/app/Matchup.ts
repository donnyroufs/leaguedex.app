import { Champion } from './Champion'

type MatchupId = `${string}-vs-${string}`

export function createMatchupId(you: Champion, enemy: Champion): MatchupId {
  return `${you.name}-vs-${enemy.name}`
}

/**
 * A matchup is a pair of champions that are playing against each other.
 */
export type Matchup = {
  id: MatchupId
  you: Champion
  enemy: Champion
}
