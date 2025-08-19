import { test, describe, expect } from 'vitest'

import { GameDetectionService } from '../src/main/app/shared-kernel/game-detection/GameDetectionService'
import { FakeTimer } from './FakeTimer'
import { EventBusSpy } from './EventBusSpy'
import { RiotApi } from '../src/main/app/shared-kernel'
import { RiotClientDataSourceStub } from './RiotClientDataSourceStub'
import { GameTickEvent } from '../src/main/app/shared-kernel/EventBus'

type Sut = {
  sut: GameDetectionService
  eventBus: EventBusSpy
  timer: FakeTimer
  dataSource: RiotClientDataSourceStub
}

function createSut(): Sut {
  const eventBus = new EventBusSpy()
  const timer = new FakeTimer()
  const dataSource = new RiotClientDataSourceStub()
  const riotApi = new RiotApi(dataSource)
  const sut = new GameDetectionService(eventBus, riotApi, timer)
  return { sut, eventBus, timer, dataSource }
}

describe('Game Detection Service', () => {
  test('should detect game start', async () => {
    const { sut, eventBus, timer, dataSource } = createSut()

    dataSource.setGameStarted()
    sut.start()

    await timer.nextTick()

    expect(eventBus.totalCalls).toEqual(2)
    expect(eventBus.hasAllEvents(['game-started', 'game-tick'])).toBe(true)
  })

  test('should detect game end', async () => {
    const { sut, eventBus, timer, dataSource } = createSut()

    dataSource.setGameStarted()
    sut.start()

    await timer.nextTick()

    dataSource.setGameTime(1)
    await timer.nextTick()

    dataSource.shouldError()
    await timer.nextTick()

    expect(eventBus.totalCalls).toEqual(4)
    expect(eventBus.hasAllEvents(['game-started', 'game-tick', 'game-tick', 'game-ended'])).toBe(
      true
    )
  })

  test('should detect game tick', async () => {
    const { sut, eventBus, timer, dataSource } = createSut()

    dataSource.setGameStarted()
    sut.start()

    dataSource.setGameTime(1)
    await timer.nextTick()

    dataSource.setGameTime(2)
    await timer.nextTick()

    expect(eventBus.totalCalls).toEqual(3)
    expect(eventBus.hasAllEvents(['game-started', 'game-tick', 'game-tick'])).toBe(true)
    const lastEvent: GameTickEvent = eventBus.lastEvent as GameTickEvent
    expect(lastEvent.data.gameTime).toEqual(2)
  })

  test('should not dispatch any events from riot api before game detection', async () => {
    const { sut, eventBus, timer, dataSource } = createSut()

    dataSource.shouldError()
    sut.start()
    await timer.nextTick()

    expect(eventBus.totalCalls).toEqual(0)
    expect(eventBus.events.length).toEqual(0)
  })

  // Test against buffer, and multiple events
  test.todo('Should not dispatch older events if first tick is not multiple events')
})
