import { describe, expect, test } from 'vitest'
import { RiotApi } from '../src/main/adapters/outbound/riot-api'
import { SimulatedRiotClientDataSource } from '../src/main/adapters/outbound'

describe('Riot Api', () => {
  test('should transform game state', async () => {
    const fakeApi = SimulatedRiotClientDataSource.createForTests()
    const sut = new RiotApi(fakeApi)

    fakeApi.setGameStarted()
    const result = await sut.getGameState()

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
