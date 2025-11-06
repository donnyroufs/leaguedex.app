import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { FakeRiotClientDataSource } from './FakeRiotClientDataSource'
import { createTestApp } from '../src/main/CompositionRoot'
import { FakeTimer } from './FakeTimer'
import { EventBusSpy } from './EventBusSpy'
import { GameTickEvent } from '../src/main/hexagon'
import { Timer } from '../src/main/adapters/outbound/Timer'

describe('Timer Unit', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('Syncs in-game ticks with the nextTick method', async () => {
    const timer = new FakeTimer()
    const dataSource = new FakeRiotClientDataSource()
    const eventBus = new EventBusSpy()

    const leaguedex = await createTestApp({ dataSource, timer, eventBus })

    await leaguedex.start()

    dataSource.addGameStartedEvent()

    await dataSource.tickMultipleTimes(timer, 3)
    await dataSource.nextTick(timer)

    const tickEvents = eventBus.events.filter((x) => x instanceof GameTickEvent)
    expect(tickEvents.map(getTickFromEvent)).toEqual([1, 2, 3, 4])
    expect(tickEvents.length).toBe(4)
  })

  test('Waits for async callback to complete before scheduling next tick', async () => {
    const timer = new Timer(1000)
    const callOrder: string[] = []

    const callback = async (): Promise<void> => {
      callOrder.push('start')
      await new Promise((resolve) => setTimeout(resolve, 500))
      callOrder.push('end')
    }

    timer.start(callback)

    await vi.advanceTimersByTimeAsync(1000)
    await vi.advanceTimersByTimeAsync(500)
    expect(callOrder).toEqual(['start', 'end'])

    await vi.advanceTimersByTimeAsync(500)
    await vi.advanceTimersByTimeAsync(500)
    expect(callOrder).toEqual(['start', 'end', 'start', 'end'])

    timer.stop()
  })

  test('Can be stopped', async () => {
    const timer = new Timer(1000)
    let callCount = 0

    const callback = async (): Promise<void> => {
      callCount++
    }

    timer.start(callback)
    await vi.advanceTimersByTimeAsync(1000)
    expect(callCount).toBe(1)

    timer.stop()

    await vi.advanceTimersByTimeAsync(5000)
    expect(callCount).toBe(1)
  })

  test('Does not overlap callbacks when async operation takes longer than interval', async () => {
    const timer = new Timer(1000)
    let executing = false

    const callback = async (): Promise<void> => {
      expect(executing).toBe(false)
      executing = true
      await new Promise((resolve) => setTimeout(resolve, 1500))
      executing = false
    }

    timer.start(callback)

    await vi.advanceTimersByTimeAsync(1000)
    expect(executing).toBe(true)

    await vi.advanceTimersByTimeAsync(1000)
    expect(executing).toBe(true)

    await vi.advanceTimersByTimeAsync(500)
    expect(executing).toBe(false)

    timer.stop()
  })
})

function getTickFromEvent(evt: GameTickEvent): number {
  return evt.payload.state.gameTime
}
