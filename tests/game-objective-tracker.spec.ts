import { beforeEach } from 'node:test'
import { GameObjectiveTracker } from './../src/main/hexagon'
import { describe, expect, test } from 'vitest'
import { GameStateBuilder } from './GameStateBuilder'

describe('GameObjectiveTracker', () => {
  let sut: GameObjectiveTracker = new GameObjectiveTracker()

  beforeEach(() => {
    sut = new GameObjectiveTracker()
  })

  test.each([
    [0, false],
    [299, false],
    [300, true]
  ])(
    'When we have not passed the 300s time mark, the dragon should not be alive',
    (gameTime, isAlive) => {
      const gameState = GameStateBuilder.asNewGame().withGameTime(gameTime).build()

      sut.track(gameState)

      const state = sut.getState()
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
      const gameState = GameStateBuilder.asNewGame().withDragonKilledEvent(killedAt).build()

      sut.track(gameState)

      const state = sut.getState()
      const dragon = state.dragon

      expect(dragon.nextSpawn).toBe(nextSpawn)
    }
  )

  test('When the dragon is killed and we have not surpassed the next spawn time, the dragon should still be dead', () => {
    const gameState = new GameStateBuilder().withGameTime(400).withDragonKilledEvent(350).build()

    sut.track(gameState)

    const state = sut.getState()
    const dragon = state.dragon

    expect(dragon.isAlive).toBe(false)
    expect(dragon.nextSpawn).toBe(650)
  })

  test('When the dragon is killed and we have surpassed the next spawn time, the dragon should be alive', () => {
    const gameState = new GameStateBuilder().withGameTime(350).withDragonKilledEvent(350)

    sut.track(gameState.build())

    const gameState2 = gameState.withGameTime(650).build()

    sut.track(gameState2)

    const state = sut.getState()
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
      const gameState = GameStateBuilder.asNewGame().withGameTime(gameTime).build()

      sut.track(gameState)

      const state = sut.getState()
      const baron = state.baron

      expect(baron.isAlive).toBe(isAlive)
    }
  )

  test.each([
    [1500, 1860],
    [1505, 1865]
  ])(
    'When the baron is killed, the next spawn time should be set to 360 seconds from the kill time',
    (killedAt, nextSpawn) => {
      const gameState = GameStateBuilder.asNewGame().withBaronKilledEvent(killedAt).build()

      sut.track(gameState)

      const state = sut.getState()
      const baron = state.baron

      expect(baron.nextSpawn).toBe(nextSpawn)
    }
  )

  test('When the baron is killed and we have not surpassed the next spawn time, the baron should still be dead', () => {
    const gameState = new GameStateBuilder().withGameTime(1600).withBaronKilledEvent(1505).build()

    sut.track(gameState)

    const state = sut.getState()
    const baron = state.baron

    expect(baron.isAlive).toBe(false)
    expect(baron.nextSpawn).toBe(1865)
  })

  test('When the baron is killed and we have surpassed the next spawn time, the baron should be alive', () => {
    const gameState = new GameStateBuilder().withGameTime(1505).withBaronKilledEvent(1505)

    sut.track(gameState.build())

    const gameState2 = gameState.withGameTime(1865).build()

    sut.track(gameState2)

    const state = sut.getState()
    const baron = state.baron

    expect(baron.isAlive).toBe(true)
    expect(baron.nextSpawn).toBe(null)
  })
})
