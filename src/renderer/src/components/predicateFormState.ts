import { Predicate, ComparisonOperator } from '@hexagon/triggers/Predicate'
import { FieldDefinition, gameStateFields } from '@hexagon/triggers/GameStateSchema'
import { FiringMode } from '@hexagon/triggers/FiringMode'

export type UiOperator = ComparisonOperator | 'contains'

export type ConditionRow = {
  field: string
  operator: UiOperator
  value: string
}

export type CustomConditionState = {
  conditions: ConditionRow[]
  combinator: 'and' | 'or'
  firingMode: 'edge' | 'edgeWithCooldown' | 'oncePerGame'
  cooldownSeconds: string
}

export const defaultConditionRow: ConditionRow = {
  field: 'activePlayer.currentMana',
  operator: '<=',
  value: ''
}

export const defaultCustomConditionState: CustomConditionState = {
  conditions: [defaultConditionRow],
  combinator: 'and',
  firingMode: 'edge',
  cooldownSeconds: '60'
}

const numericOperators: UiOperator[] = ['<', '<=', '==', '!=', '>=', '>']
const equalityOperators: UiOperator[] = ['==', '!=']
const arrayOperators: UiOperator[] = ['contains']

export function getOperatorsForField(field: FieldDefinition | undefined): UiOperator[] {
  if (!field) return numericOperators
  if (field.kind === 'boolean') return equalityOperators
  if (field.kind === 'enum') return equalityOperators
  if (field.kind === 'numberArray') return arrayOperators
  return numericOperators
}

export function isBooleanField(field: FieldDefinition | undefined): boolean {
  return field?.kind === 'boolean'
}

export function isEnumField(field: FieldDefinition | undefined): boolean {
  return field?.kind === 'enum'
}

export function isArrayField(field: FieldDefinition | undefined): boolean {
  return field?.kind === 'numberArray'
}

export function defaultValueForField(field: FieldDefinition | undefined): string {
  if (!field) return ''
  if (field.kind === 'boolean') return 'true'
  if (field.kind === 'enum') return field.enumValues?.[0] ?? ''
  return ''
}

export function validateConditionRows(state: CustomConditionState): Record<number, string> {
  const errors: Record<number, string> = {}
  state.conditions.forEach((row, i) => {
    const field = gameStateFields.find((f) => f.path === row.field)
    if (!field) {
      errors[i] = 'Unknown field'
      return
    }
    if (field.kind === 'boolean') return

    if (field.kind === 'enum') {
      if (!row.value) errors[i] = 'Select a value'
      return
    }

    if (!row.value.toString().trim()) {
      errors[i] = 'Value is required'
      return
    }
    const n = Number(row.value)
    if (!Number.isFinite(n)) {
      errors[i] = 'Value must be a number'
    }
  })
  return errors
}

function buildLeafFromRow(row: ConditionRow): Predicate | null {
  const field = gameStateFields.find((f) => f.path === row.field)
  if (!field) return null

  if (row.operator === 'contains') {
    const numericValue = Number(row.value)
    if (!Number.isFinite(numericValue)) return null
    return { op: 'contains', field: row.field, value: numericValue }
  }

  if (field.kind === 'boolean') {
    return {
      op: 'cmp',
      field: row.field,
      operator: row.operator,
      value: row.value === 'true'
    }
  }

  if (field.kind === 'enum') {
    if (!row.value) return null
    return { op: 'cmp', field: row.field, operator: row.operator, value: row.value }
  }

  const numericValue = Number(row.value)
  if (!Number.isFinite(numericValue)) return null

  return { op: 'cmp', field: row.field, operator: row.operator, value: numericValue }
}

export function buildPredicateFromState(state: CustomConditionState): Predicate | null {
  if (state.conditions.length === 0) return null

  const leaves: Predicate[] = []
  for (const row of state.conditions) {
    const leaf = buildLeafFromRow(row)
    if (!leaf) return null
    leaves.push(leaf)
  }

  if (leaves.length === 1) return leaves[0]

  return { op: state.combinator, children: leaves }
}

export function buildFiringModeFromState(state: CustomConditionState): FiringMode | null {
  switch (state.firingMode) {
    case 'edge':
      return { mode: 'edge' }
    case 'oncePerGame':
      return { mode: 'oncePerGame' }
    case 'edgeWithCooldown': {
      const cooldownSeconds = Number(state.cooldownSeconds)
      if (!Number.isFinite(cooldownSeconds) || cooldownSeconds <= 0) return null
      return { mode: 'edgeWithCooldown', cooldownSeconds }
    }
  }
}

function rowFromLeaf(predicate: Predicate): ConditionRow | null {
  if (predicate.op === 'cmp') {
    return {
      field: predicate.field,
      operator: predicate.operator,
      value: String(predicate.value)
    }
  }
  if (predicate.op === 'contains') {
    return {
      field: predicate.field,
      operator: 'contains',
      value: String(predicate.value)
    }
  }
  return null
}

/**
 * Builds a CustomConditionState from an existing predicate trigger, for edit mode.
 * Accepts a single comparison/contains, or a flat top-level and/or of only comparisons/contains.
 * Returns null for anything nested (and-of-or, NOT, etc.).
 */
export function stateFromPredicate(
  predicate: Predicate,
  firing: FiringMode
): CustomConditionState | null {
  const firingMode = firing.mode
  const cooldownSeconds = firing.mode === 'edgeWithCooldown' ? String(firing.cooldownSeconds) : '60'

  if (predicate.op === 'cmp' || predicate.op === 'contains') {
    const row = rowFromLeaf(predicate)
    if (!row) return null
    return {
      conditions: [row],
      combinator: 'and',
      firingMode,
      cooldownSeconds
    }
  }

  if (predicate.op === 'and' || predicate.op === 'or') {
    const rows: ConditionRow[] = []
    for (const child of predicate.children) {
      const row = rowFromLeaf(child)
      if (!row) return null
      rows.push(row)
    }
    return {
      conditions: rows,
      combinator: predicate.op,
      firingMode,
      cooldownSeconds
    }
  }

  return null
}
