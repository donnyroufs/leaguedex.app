import { PredicateEvaluator } from '@hexagon/triggers/PredicateEvaluator'
import { Predicate } from '@hexagon/triggers/Predicate'
import { GameState } from '@hexagon/GameState'
import { GameStateAssembler } from '@hexagon/GameStateAssembler'
import { describe, test, expect } from 'vitest'
import { TestGameDataBuilder } from './TestGameDataBuilder'

describe('PredicateEvaluator', () => {
  const state = (build: (b: TestGameDataBuilder) => TestGameDataBuilder): GameState =>
    new GameStateAssembler().assemble(build(new TestGameDataBuilder().withGameTime(100)).build())

  describe('cmp on numeric fields', () => {
    test.each([
      ['<', 100, 99, true],
      ['<', 100, 100, false],
      ['<=', 100, 100, true],
      ['==', 100, 100, true],
      ['==', 100, 99, false],
      ['!=', 100, 99, true],
      ['>=', 100, 100, true],
      ['>', 100, 101, true]
    ] as const)('%s %d against %d', (operator, threshold, actual, expected) => {
      const predicate: Predicate = {
        op: 'cmp',
        field: 'activePlayer.currentGold',
        operator,
        value: threshold
      }
      const s = state((b) => b.withCurrentGold(actual))
      expect(PredicateEvaluator.evaluate(predicate, s)).toBe(expected)
    })
  })

  test('cmp returns false when field is null', () => {
    const predicate: Predicate = {
      op: 'cmp',
      field: 'activePlayer.currentMana',
      operator: '<',
      value: 100
    }
    const s = new GameStateAssembler().assemble({
      hasStarted: true,
      gameTime: 100,
      events: [],
      activePlayer: {
        summonerName: 'Test',
        isAlive: true,
        respawnsIn: null,
        currentMana: null,
        totalMana: null,
        currentGold: 0,
        items: [],
        team: 'blue'
      }
    })
    expect(PredicateEvaluator.evaluate(predicate, s)).toBe(false)
  })

  test('cmp on derived manaPercent', () => {
    const predicate: Predicate = {
      op: 'cmp',
      field: 'activePlayer.manaPercent',
      operator: '<',
      value: 30
    }
    const s = state((b) => b.withCurrentPlayerMana(20).withTotalMana(100))
    expect(PredicateEvaluator.evaluate(predicate, s)).toBe(true)
  })

  test('cmp on enum (string) field — team equality', () => {
    const matchBlue: Predicate = {
      op: 'cmp',
      field: 'activePlayer.team',
      operator: '==',
      value: 'blue'
    }
    const blueState = state((b) => b.withTeam('blue'))
    const redState = state((b) => b.withTeam('red'))

    expect(PredicateEvaluator.evaluate(matchBlue, blueState)).toBe(true)
    expect(PredicateEvaluator.evaluate(matchBlue, redState)).toBe(false)
  })

  test('cmp on derived objectives.dragon.secondsUntilSpawn', () => {
    const predicate: Predicate = {
      op: 'cmp',
      field: 'objectives.dragon.secondsUntilSpawn',
      operator: '<=',
      value: 30
    }
    const s = state((b) => b.withGameTime(280))
    expect(PredicateEvaluator.evaluate(predicate, s)).toBe(true)
  })

  test('derived objectives.dragon.myTeamKills reflects active player team', () => {
    const predicate: Predicate = {
      op: 'cmp',
      field: 'objectives.dragon.myTeamKills',
      operator: '>=',
      value: 1
    }
    const neutralStart = state((b) => b.withGameTime(100).withTeam('blue'))
    expect(PredicateEvaluator.evaluate(predicate, neutralStart)).toBe(false)
  })

  test('cmp on boolean field', () => {
    const predicate: Predicate = {
      op: 'cmp',
      field: 'activePlayer.isAlive',
      operator: '==',
      value: false
    }
    const s = state((b) => b.withIsAlive(false))
    expect(PredicateEvaluator.evaluate(predicate, s)).toBe(true)
  })

  test('cmp returns false when comparing boolean field with <', () => {
    const predicate: Predicate = {
      op: 'cmp',
      field: 'activePlayer.isAlive',
      operator: '<',
      value: true
    }
    const s = state((b) => b)
    expect(PredicateEvaluator.evaluate(predicate, s)).toBe(false)
  })

  test('contains returns true when item in list', () => {
    const predicate: Predicate = {
      op: 'contains',
      field: 'activePlayer.items',
      value: 3078
    }
    const s = state((b) => b.withItems([3078, 3006]))
    expect(PredicateEvaluator.evaluate(predicate, s)).toBe(true)
  })

  test('contains returns false when item not in list', () => {
    const predicate: Predicate = {
      op: 'contains',
      field: 'activePlayer.items',
      value: 9999
    }
    const s = state((b) => b.withItems([3078, 3006]))
    expect(PredicateEvaluator.evaluate(predicate, s)).toBe(false)
  })

  test('and combines children with logical AND', () => {
    const predicate: Predicate = {
      op: 'and',
      children: [
        { op: 'cmp', field: 'activePlayer.currentGold', operator: '>=', value: 3000 },
        { op: 'cmp', field: 'gameTime', operator: '>=', value: 600 }
      ]
    }
    const stateAtEight = state((b) => b.withGameTime(480).withCurrentGold(3000))
    expect(PredicateEvaluator.evaluate(predicate, stateAtEight)).toBe(false)

    const stateAtTen = state((b) => b.withGameTime(600).withCurrentGold(3000))
    expect(PredicateEvaluator.evaluate(predicate, stateAtTen)).toBe(true)
  })

  test('or combines children with logical OR', () => {
    const predicate: Predicate = {
      op: 'or',
      children: [
        { op: 'cmp', field: 'activePlayer.currentGold', operator: '>=', value: 10000 },
        { op: 'cmp', field: 'gameTime', operator: '>=', value: 600 }
      ]
    }
    const s = state((b) => b.withGameTime(700).withCurrentGold(500))
    expect(PredicateEvaluator.evaluate(predicate, s)).toBe(true)
  })

  test('not inverts child', () => {
    const predicate: Predicate = {
      op: 'not',
      child: { op: 'cmp', field: 'activePlayer.isAlive', operator: '==', value: true }
    }
    const alive = state((b) => b.withIsAlive(true))
    const dead = state((b) => b.withIsAlive(false))
    expect(PredicateEvaluator.evaluate(predicate, alive)).toBe(false)
    expect(PredicateEvaluator.evaluate(predicate, dead)).toBe(true)
  })

  test('unknown field returns false', () => {
    const predicate: Predicate = {
      op: 'cmp',
      field: 'does.not.exist',
      operator: '==',
      value: 1
    }
    const s = state((b) => b)
    expect(PredicateEvaluator.evaluate(predicate, s)).toBe(false)
  })
})
