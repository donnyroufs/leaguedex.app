import { describe, expect, test } from 'vitest'

import { LiveGameData, SimulatedRiotClientDataSource } from '../src/main/app/shared-kernel'
import { EventBusSpy } from './EventBusSpy'

const implementations = [
  {
    name: 'Simulated',
    instance: SimulatedRiotClientDataSource.create(new EventBusSpy())
  }
]

describe.each(implementations)('$name should implement contract', async (implementation) => {
  // TODO: add exact contract
  const contract: LiveGameData

  test('should return game state', async () => {
    const result = await implementation.instance.getGameData()
    expect(result.isOk()).toBe(true)
    expect(result.getValue()).toEqual(contract)
  })

  test.todo('should return error if failed to get game state')
})
