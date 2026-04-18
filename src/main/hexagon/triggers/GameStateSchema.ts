import { GameState } from '../GameState'

export type FieldKind = 'number' | 'nullableNumber' | 'boolean' | 'numberArray' | 'enum'

export type FieldDefinition = {
  path: string
  label: string
  kind: FieldKind
  unit?: string
  nullMeans?: string
  enumValues?: readonly string[]
}

export const gameStateFields: readonly FieldDefinition[] = [
  { path: 'gameTime', label: 'Game time', kind: 'number', unit: 'seconds' },

  { path: 'activePlayer.isAlive', label: 'You are alive', kind: 'boolean' },
  {
    path: 'activePlayer.respawnsIn',
    label: 'Seconds until respawn',
    kind: 'nullableNumber',
    unit: 'seconds',
    nullMeans: 'alive'
  },
  {
    path: 'activePlayer.currentMana',
    label: 'Current mana',
    kind: 'nullableNumber',
    nullMeans: 'non-mana champion'
  },
  {
    path: 'activePlayer.totalMana',
    label: 'Max mana',
    kind: 'nullableNumber',
    nullMeans: 'non-mana champion'
  },
  {
    path: 'activePlayer.manaPercent',
    label: 'Mana %',
    kind: 'nullableNumber',
    unit: '%',
    nullMeans: 'non-mana champion'
  },
  { path: 'activePlayer.currentGold', label: 'Current gold', kind: 'number' },
  { path: 'activePlayer.items', label: 'Your items', kind: 'numberArray' },
  {
    path: 'activePlayer.team',
    label: 'Your team',
    kind: 'enum',
    enumValues: ['blue', 'red']
  },

  { path: 'objectives.dragon.isAlive', label: 'Dragon alive', kind: 'boolean' },
  {
    path: 'objectives.dragon.secondsUntilSpawn',
    label: 'Seconds until dragon spawn',
    kind: 'nullableNumber',
    unit: 'seconds',
    nullMeans: 'dragon is alive'
  },
  {
    path: 'objectives.dragon.myTeamKills',
    label: 'Your team dragons killed',
    kind: 'number'
  },
  {
    path: 'objectives.dragon.enemyTeamKills',
    label: 'Enemy team dragons killed',
    kind: 'number'
  },

  { path: 'objectives.baron.isAlive', label: 'Baron alive', kind: 'boolean' },
  {
    path: 'objectives.baron.secondsUntilSpawn',
    label: 'Seconds until baron spawn',
    kind: 'nullableNumber',
    unit: 'seconds',
    nullMeans: 'baron is alive'
  },

  { path: 'objectives.grubs.isAlive', label: 'Grubs alive', kind: 'boolean' },
  {
    path: 'objectives.grubs.secondsUntilSpawn',
    label: 'Seconds until grubs spawn',
    kind: 'nullableNumber',
    unit: 'seconds',
    nullMeans: 'grubs are alive'
  },

  { path: 'objectives.herald.isAlive', label: 'Herald alive', kind: 'boolean' },
  {
    path: 'objectives.herald.secondsUntilSpawn',
    label: 'Seconds until herald spawn',
    kind: 'nullableNumber',
    unit: 'seconds',
    nullMeans: 'herald is alive'
  },

  { path: 'objectives.atakhan.isAlive', label: 'Atakhan alive', kind: 'boolean' },
  {
    path: 'objectives.atakhan.secondsUntilSpawn',
    label: 'Seconds until atakhan spawn',
    kind: 'nullableNumber',
    unit: 'seconds',
    nullMeans: 'atakhan is alive'
  }
] as const

const fieldsByPath = new Map(gameStateFields.map((f) => [f.path, f]))

export function getFieldDefinition(path: string): FieldDefinition | undefined {
  return fieldsByPath.get(path)
}

export function isKnownField(path: string): boolean {
  return fieldsByPath.has(path)
}

export function readField(state: GameState, path: string): unknown {
  const parts = path.split('.')
  let cursor: unknown = state
  for (const part of parts) {
    if (cursor == null || typeof cursor !== 'object') return undefined
    cursor = (cursor as Record<string, unknown>)[part]
  }
  return cursor
}
