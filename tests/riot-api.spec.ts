import { describe, expect, test } from 'vitest'
import { RiotApi } from '../src/main/adapters/outbound/riot-api'
import { RiotClientDataSourceStub } from './RiotClientDataSourceStub'

describe('Riot Api', () => {
  test('should transform game state', async () => {
    const stub = new RiotClientDataSourceStub()
    const sut = new RiotApi(stub)

    stub.setGameStarted()
    stub.setGameTime(0)

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
      gameTime: 0
    })
  })
})
