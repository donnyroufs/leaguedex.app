import { CueEngine } from '@hexagon/CueEngine'
import { test, describe, expect } from 'vitest'
import { CueBuilder } from './CueBuilder'
import { TestGameDataBuilder } from './TestGameDataBuilder'
import { GameStateAssembler } from '@hexagon/GameStateAssembler'

describe('CueEngine', () => {
  // TODO: use fastcheck
  test.each([
    [150, 0],
    [155, 1],
    [160, 0],
    [245, 1],
    [250, 0],
    [335, 1],
    [340, 0],
    [425, 1],
    [430, 0],
    [515, 1],
    [520, 0]
  ])('should return the correct cues for the canon wave spawned event', (gameTime, expected) => {
    const assembler = new GameStateAssembler()
    const cue = new CueBuilder().asCanonWaveSpawned().build()

    const gameData = new TestGameDataBuilder().withGameTime(gameTime).hasStarted().build()

    const state = assembler.assemble(gameData)

    const due = CueEngine.getDueCues(state, [cue])

    expect(due).toHaveLength(expected)
  })

  test('should trigger the mana cue if the mana is less than the value', () => {
    const assembler = new GameStateAssembler()
    const cue = new CueBuilder().asManaChanged().withValue(100).build()

    const gameData = new TestGameDataBuilder()
      .withGameTime(150)
      .hasStarted()
      .withCurrentPlayerMana(99)
      .build()

    const state = assembler.assemble(gameData)

    const due = CueEngine.getDueCues(state, [cue])

    expect(due).toHaveLength(1)
    expect(due[0].id).toBe(cue.id)
  })

  test('should not trigger the mana cue if the mana is greater than the value', () => {
    const assembler = new GameStateAssembler()
    const cue = new CueBuilder().asManaChanged().withValue(100).build()

    const gameData = new TestGameDataBuilder()
      .withGameTime(150)
      .hasStarted()
      .withCurrentPlayerMana(150)
      .build()

    const state = assembler.assemble(gameData)
    const due = CueEngine.getDueCues(state, [cue])

    expect(due).toHaveLength(0)
    expect(due).toEqual([])
  })

  test('should not trigger the mana cue if its equal to the total mana', () => {
    const assembler = new GameStateAssembler()
    const cue = new CueBuilder().asManaChanged().withValue(100).build()

    const gameData = new TestGameDataBuilder()
      .withGameTime(150)
      .hasStarted()
      .withCurrentPlayerMana(100)
      .withTotalMana(100)
      .build()

    const state = assembler.assemble(gameData)
    const due = CueEngine.getDueCues(state, [cue])

    expect(due).toHaveLength(0)
    expect(due).toEqual([])
  })

  // Need to decide if we make the cue engine stateful or not
  test.each([
    { tick: 150, expectedDueCount: 1, desc: 'first tick triggers' },
    { tick: 180, expectedDueCount: 0, desc: '30 ticks later does not trigger again' },
    { tick: 209, expectedDueCount: 0, desc: '59 ticks later does not trigger again' }
  ])('Should not keep triggering the mana cue: $desc', ({ tick, expectedDueCount }) => {
    const assembler = new GameStateAssembler()
    const cue = new CueBuilder().asManaChanged().withValue(100).build()

    if (tick !== 150) {
      const gameDataFirst = new TestGameDataBuilder()
        .withGameTime(150)
        .hasStarted()
        .withCurrentPlayerMana(99)
        .build()
      const stateFirst = assembler.assemble(gameDataFirst)
      CueEngine.getDueCues(stateFirst, [cue])
    }

    const gameData = new TestGameDataBuilder()
      .withGameTime(tick)
      .hasStarted()
      .withCurrentPlayerMana(99)
      .build()

    const state = assembler.assemble(gameData)
    const due = CueEngine.getDueCues(state, [cue])

    expect(due).toHaveLength(expectedDueCount)
  })
})
