import { Champion } from './Champion'
import { MatchupNote } from './MatchupNote'

export type MatchupId = `${string}-vs-${string}-${string}`

export function createMatchupId(you: Champion, enemy: Champion): MatchupId {
  return `${you.name.toLowerCase()}-${you.role.toLowerCase()}-vs-${enemy.name.toLowerCase()}-${enemy.role.toLowerCase()}`
}

export function parseMatchupId(matchupId: MatchupId): {
  you: Pick<Champion, 'name' | 'role'>
  enemy: Pick<Champion, 'name' | 'role'>
} {
  const [youName, youRole, enemyName, enemyRole] = matchupId.split('-')

  return {
    you: { name: youName, role: youRole as unknown as Champion['role'] },
    enemy: { name: enemyName, role: enemyRole as unknown as Champion['role'] }
  }
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
