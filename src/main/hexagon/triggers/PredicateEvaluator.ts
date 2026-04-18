import { GameState } from '../GameState'
import { Predicate } from './Predicate'
import { readField } from './GameStateSchema'

export class PredicateEvaluator {
  public static evaluate(predicate: Predicate, state: GameState): boolean {
    switch (predicate.op) {
      case 'and':
        return predicate.children.every((child) => this.evaluate(child, state))
      case 'or':
        return predicate.children.some((child) => this.evaluate(child, state))
      case 'not':
        return !this.evaluate(predicate.child, state)
      case 'cmp':
        return this.compare(state, predicate.field, predicate.operator, predicate.value)
      case 'contains':
        return this.contains(state, predicate.field, predicate.value)
    }
  }

  private static compare(
    state: GameState,
    field: string,
    operator: '<' | '<=' | '==' | '!=' | '>=' | '>',
    value: number | boolean | string
  ): boolean {
    const actual = readField(state, field)

    if (actual === null || actual === undefined) {
      return false
    }

    if (typeof actual === 'boolean' && typeof value === 'boolean') {
      if (operator === '==') return actual === value
      if (operator === '!=') return actual !== value
      return false
    }

    if (typeof actual === 'string' && typeof value === 'string') {
      if (operator === '==') return actual === value
      if (operator === '!=') return actual !== value
      return false
    }

    if (typeof actual === 'number' && typeof value === 'number') {
      switch (operator) {
        case '<':
          return actual < value
        case '<=':
          return actual <= value
        case '==':
          return actual === value
        case '!=':
          return actual !== value
        case '>=':
          return actual >= value
        case '>':
          return actual > value
      }
    }

    return false
  }

  private static contains(state: GameState, field: string, value: number | string): boolean {
    const actual = readField(state, field)
    if (!Array.isArray(actual)) return false
    return actual.includes(value)
  }
}
