import { describe, expect, test } from 'vitest'

import { GameObjectiveTracker } from './../src/main/hexagon'
import { TestGameDataBuilder } from './TestGameDataBuilder'

describe('GameObjectiveTracker', () => {
  test.each([
    [0, false],
    [299, false],
    [300, true]
  ])(
    'When we have not passed the 300s time mark, the dragon should not be alive',
    (gameTime, isAlive) => {
      const gameData = new TestGameDataBuilder().withGameTime(gameTime).hasStarted().build()

      const state = GameObjectiveTracker.track(null, gameData)

      const dragon = state.dragon

      expect(dragon.isAlive).toBe(isAlive)
    }
  )

  test.each([
    [300, 600],
    [350, 650]
  ])(
    'When the dragon is killed, the next spawn time should be set to 300 seconds from the kill time',
    (killedAt, nextSpawn) => {
      const gameData = new TestGameDataBuilder()
        .hasStarted()
        .withDragonKilledEvent(killedAt)
        .build()

      const state = GameObjectiveTracker.track(null, gameData)

      const dragon = state.dragon

      expect(dragon.nextSpawn).toBe(nextSpawn)
    }
  )

  test('When the dragon is killed and we have not surpassed the next spawn time, the dragon should still be dead', () => {
    const gameData = new TestGameDataBuilder().withGameTime(400).withDragonKilledEvent(350).build()

    const state = GameObjectiveTracker.track(null, gameData)

    const dragon = state.dragon

    expect(dragon.isAlive).toBe(false)
    expect(dragon.nextSpawn).toBe(650)
  })

  test('When the dragon is killed and we have surpassed the next spawn time, the dragon should be alive', () => {
    const gameData = new TestGameDataBuilder().withGameTime(650).withDragonKilledEvent(350).build()
    const state = GameObjectiveTracker.track(null, gameData)
    const dragon = state.dragon

    expect(dragon.isAlive).toBe(true)
    expect(dragon.nextSpawn).toBe(null)
  })

  test.todo('When a team has killed 4 dragons then the next dragon is going to be an elder drake')

  test.each([
    [0, false],
    [1499, false],
    [1500, true]
  ])(
    'When we have not passed the 1500s time mark, the baron should not be alive',
    (gameTime, isAlive) => {
      const gameData = new TestGameDataBuilder().withGameTime(gameTime).hasStarted().build()

      const state = GameObjectiveTracker.track(null, gameData)

      const baron = state.baron

      expect(baron.isAlive).toBe(isAlive)
    }
  )

  test.each([
    [1505, 1865],
    [1510, 1870]
  ])(
    'When the baron is killed, the next spawn time should be set to 360 seconds from the kill time',
    (killedAt, nextSpawn) => {
      const gameData = new TestGameDataBuilder()
        .withGameTime(killedAt)
        .withBaronKilledEvent(killedAt)
        .build()

      const state = GameObjectiveTracker.track(null, gameData)

      const baron = state.baron

      expect(baron.nextSpawn).toBe(nextSpawn)
    }
  )

  test('When the baron is killed and we have not surpassed the next spawn time, the baron should still be dead', () => {
    const gameData = new TestGameDataBuilder().withGameTime(1600).withBaronKilledEvent(1505).build()

    const state = GameObjectiveTracker.track(null, gameData)

    const baron = state.baron

    expect(baron.isAlive).toBe(false)
    expect(baron.nextSpawn).toBe(1865)
  })

  test('When the baron is killed and we have surpassed the next spawn time, the baron should be alive', () => {
    const gameData = new TestGameDataBuilder().withGameTime(1865).withBaronKilledEvent(1505).build()

    const state = GameObjectiveTracker.track(null, gameData)

    const baron = state.baron

    expect(baron.isAlive).toBe(true)
    expect(baron.nextSpawn).toBe(null)
  })

  test.each([
    ['grubs', 0],
    ['grubs', 30],
    ['herald', 0],
    ['herald', 30],
    ['atakhan', 0],
    ['atakhan', 30]
  ])('The %s should not be alive at the start of the game', (objective, gameTime) => {
    const gameData = new TestGameDataBuilder().withGameTime(gameTime).hasStarted().build()

    const state = GameObjectiveTracker.track(null, gameData)

    expect(state[objective].isAlive).toBe(false)
  })

  test.each([
    ['grubs', 480],
    ['herald', 900],
    ['atakhan', 1200]
  ])('The %s should be alive after %s seconds', (objective, spawnTime) => {
    const gameData = new TestGameDataBuilder().withGameTime(spawnTime).hasStarted().build()

    const state = GameObjectiveTracker.track(null, gameData)

    expect(state[objective].isAlive).toBe(true)
    expect(state[objective].nextSpawn).toBe(null)
  })

  test.each([
    ['grubs', 480, 900],
    ['herald', 900, 1500] // 1500 is baron timer, which will replace herald
  ])(
    'Sets %s automatically to died if the next spawn for the next related objective happened',
    (objective, spawnTime, nextObjective) => {
      const previousGameData = new TestGameDataBuilder()
        .withGameTime(spawnTime)
        .hasStarted()
        .build()
      const newGameData = new TestGameDataBuilder().withGameTime(nextObjective).hasStarted().build()

      const oldState = GameObjectiveTracker.track(null, previousGameData)
      const newState = GameObjectiveTracker.track(oldState, newGameData)

      expect(newState[objective].isAlive).toBe(false)
      expect(newState[objective].nextSpawn).toBe(null)
    }
  )

  test('When the dragon has been killed four times by a given team, the next dragon should be an elder drake, meaning spawn times change', () => {
    const gameData = new TestGameDataBuilder()
      .withGameTime(0)
      .withDragonKilledEvent(300, 'red')
      .withDragonKilledEvent(600, 'red')
      .withDragonKilledEvent(900, 'red')
      .withDragonKilledEvent(1200, 'red')
      .build()

    const state = GameObjectiveTracker.track(null, gameData)

    const dragon = state.dragon

    expect(dragon.nextSpawn).toBe(1560)
  })

  // Probably want to test this more but im writing this at a stage where I know Im going to be
  // rewriting the tracker anyway.
  test('should track objectives across multiple game states', () => {
    const firstGameData = new TestGameDataBuilder()
      .withGameTime(300)
      .withDragonKilledEvent(300)
      .hasStarted()
      .build()

    const secondGameData = new TestGameDataBuilder()
      .withGameTime(600)
      .withDragonKilledEvent(600)
      .hasStarted()
      .build()

    const firstState = GameObjectiveTracker.track(null, firstGameData)
    const secondState = GameObjectiveTracker.track(firstState, secondGameData)

    expect(secondState.dragon.teamStats.red).toBe(2)
    expect(secondState.dragon.isAlive).toBe(false)
    expect(secondState.dragon.nextSpawn).toBe(900)
  })

  test.todo('only spawns once, we need to replace X and Y')
})
