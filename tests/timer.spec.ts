import { describe, test, expect } from 'vitest'
import { FakeRiotClientDataSource } from './FakeRiotClientDataSource'
import { createTestApp } from '../src/main/CompositionRoot'
import { FakeTimer } from './FakeTimer'
import { EventBusSpy } from './EventBusSpy'
import { GameTickEvent } from '../src/main/hexagon'

/**
 * Sanity check that the timer integration works as expected
 */
describe('Timer', () => {
  test('Syncs in-game ticks with the nextTick method', async () => {
    const timer = new FakeTimer()
    const dataSource = new FakeRiotClientDataSource()
    const eventBus = new EventBusSpy()

    const leaguedex = await createTestApp({ dataSource, timer, eventBus })

    await leaguedex.start()

    dataSource.addGameStartedEvent()

    await dataSource.tickMultipleTimes(timer, 3)
    await dataSource.nextTick(timer)

    expect(eventBus.events.map((x) => getTickFromEvent(x as unknown as GameTickEvent))).toEqual([
      1, 2, 3, 4
    ])
  })
})

function getTickFromEvent(evt: GameTickEvent): number {
  if ('state' in evt.data) {
    return evt.data.state.gameTime
  }

  return -1
}
