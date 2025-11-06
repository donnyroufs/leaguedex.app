import { describe, expect, test } from 'vitest'
import { RiotLiveClientApi } from '../src/main/adapters/outbound/game-data'
import { SimulatedRiotClientDataSource } from '../src/main/adapters/outbound'

describe('Game Data Provider', () => {
  test('should transform game state but not include game started event', async () => {
    const fakeApi = SimulatedRiotClientDataSource.createForTests()
    const sut = new RiotLiveClientApi(fakeApi)

    fakeApi.setGameStarted()
    const result = await sut.getGameData()

    expect(result.isOk()).toBe(true)
    expect(result.getValue()).toEqual({
      hasStarted: true,
      events: [],
      gameTime: 0,
      activePlayer: {
        summonerName: 'test#1234',
        isAlive: true,
        respawnsIn: null,
        currentMana: 0,
        totalMana: 0,
        items: []
      }
    })
  })

  test.todo('should floor gameTime from float to integer')
  test.todo('should floor dragon kill EventTime from float to integer')
  test.todo('should floor baron kill EventTime from float to integer')

  test.todo('Should transform dragon kill event')
  test.todo('Should transform baron kill event')
})
