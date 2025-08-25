import { describe, expect, test } from 'vitest'
import { RiotLiveClientApi } from '../src/main/adapters/outbound/game-data'
import { SimulatedRiotClientDataSource } from '../src/main/adapters/outbound'

describe('Game Data Provider', () => {
  test('should transform game state', async () => {
    const fakeApi = SimulatedRiotClientDataSource.createForTests()
    const sut = new RiotLiveClientApi(fakeApi)

    fakeApi.setGameStarted()
    const result = await sut.getGameData()

    expect(result.isOk()).toBe(true)
    expect(result.getValue()).toEqual({
      events: [
        {
          eventType: 'game-started',
          data: {
            gameTime: 0
          },
          id: expect.any(Number)
        }
      ],
      gameTime: 0,
      activePlayer: {
        summonerName: 'test#1234',
        isAlive: true,
        respawnsIn: null
      }
    })
  })
})
