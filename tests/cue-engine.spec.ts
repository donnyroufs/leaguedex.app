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
})
