import { CueEngine } from '@hexagon/CueEngine'
import { test, describe, expect, beforeEach } from 'vitest'
import { CueBuilder } from './CueBuilder'
import { TestGameDataBuilder } from './TestGameDataBuilder'
import { GameStateAssembler } from '@hexagon/GameStateAssembler'

describe('CueEngine', () => {
  beforeEach(() => {
    CueEngine.clear()
  })

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

  test('Should not keep triggering the mana cue', () => {
    const assembler = new GameStateAssembler()
    const cue = new CueBuilder().asManaChanged().withValue(100).build()

    const gameData = new TestGameDataBuilder()
      .withGameTime(150)
      .hasStarted()
      .withCurrentPlayerMana(90)
      .build()

    const state = assembler.assemble(gameData)
    const due = CueEngine.getDueCues(state, [cue])
    expect(due).toHaveLength(1)

    const gameData2 = new TestGameDataBuilder()
      .withGameTime(210)
      .hasStarted()
      .withCurrentPlayerMana(95)
      .build()

    const state2 = assembler.assemble(gameData2)
    const due2 = CueEngine.getDueCues(state2, [cue])
    expect(due2).toHaveLength(1)

    const gameData3 = new TestGameDataBuilder()
      .withGameTime(211)
      .hasStarted()
      .withCurrentPlayerMana(96)
      .build()

    const state3 = assembler.assemble(gameData3)
    const due3 = CueEngine.getDueCues(state3, [cue])
    expect(due3).toHaveLength(0)
  })
})
