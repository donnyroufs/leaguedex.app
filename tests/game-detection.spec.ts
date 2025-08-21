import { test, describe, expect } from 'vitest'

import { GameDetectionService } from '../src/main/hexagon/GameDetectionService'
import { FakeTimer } from './FakeTimer'
import { EventBusSpy } from './EventBusSpy'
import { RiotApi, SimulatedRiotClientDataSource } from '../src/main/adapters/outbound/riot-api'
import { GameTickEvent } from '../src/main/hexagon/events/GameTickEvent'
import { ElectronLogger } from '../src/main/adapters/outbound/ElectronLogger'

type Sut = {
  sut: GameDetectionService
  eventBus: EventBusSpy
  timer: FakeTimer
  dataSource: SimulatedRiotClientDataSource
}

function createSut(): Sut {
  const eventBus = new EventBusSpy()
  const timer = new FakeTimer()
  const dataSource = SimulatedRiotClientDataSource.createForTests()
  const riotApi = new RiotApi(dataSource)
  const sut = new GameDetectionService(eventBus, riotApi, timer, ElectronLogger.createNull())
  return { sut, eventBus, timer, dataSource }
}

describe('Game Detection Service', () => {
  test('should detect game start', async () => {
    const { sut, eventBus, timer, dataSource } = createSut()

    dataSource.setGameStarted()
    sut.start() // game-started
    await timer.tick()

    expect(eventBus.totalCalls).toEqual(1)
    expect(eventBus.hasAllEventsInOrder(['game-started'])).toBe(true)
  })

  test('should not detect game start when game-started event is not present', async () => {
    const { sut, eventBus, timer, dataSource } = createSut()

    dataSource.gameStateWithoutEvents()
    sut.start()
    await timer.tick()

    expect(eventBus.totalCalls).toEqual(0)
    expect(eventBus.events.length).toEqual(0)
  })

  test('should detect game end', async () => {
    const { sut, eventBus, timer, dataSource } = createSut()

    dataSource.setGameStarted()
    sut.start()
    await timer.tick() // game-started

    dataSource.nextTick()
    await timer.tick() // game-tick

    dataSource.nextTick()
    await timer.tick() // game-tick

    dataSource.simulateError()
    await timer.tick() // game-ended

    expect(eventBus.totalCalls).toEqual(4)
    expect(
      eventBus.hasAllEventsInOrder(['game-started', 'game-tick', 'game-tick', 'game-ended'])
    ).toBe(true)
  })

  test('should detect game tick', async () => {
    const { sut, eventBus, timer, dataSource } = createSut()

    dataSource.setGameStarted()
    sut.start()
    await timer.tick() // game-started

    dataSource.nextTick()
    await timer.tick() // game-tick

    dataSource.nextTick()
    await timer.tick() // game-tick

    expect(eventBus.totalCalls).toEqual(3)
    expect(eventBus.hasAllEventsInOrder(['game-started', 'game-tick', 'game-tick'])).toBe(true)
    const lastEvent: GameTickEvent = eventBus.lastEvent as GameTickEvent
    expect(lastEvent.data.state.gameTime).toEqual(2)
  })

  test('should not dispatch any events from riot api before game detection', async () => {
    const { sut, eventBus, timer, dataSource } = createSut()

    dataSource.simulateError()
    sut.start()
    await timer.tick() // no events

    expect(eventBus.totalCalls).toEqual(0)
    expect(eventBus.events.length).toEqual(0)
  })

  test('should not dispatch any events when received null', async () => {
    const { sut, eventBus, timer, dataSource } = createSut()

    dataSource.simulateNull()
    sut.start()
    await timer.tick() // no events

    expect(eventBus.totalCalls).toEqual(0)
    expect(eventBus.events.length).toEqual(0)
  })

  test('Should only emit game-tick on 1 after game-started', async () => {
    const { sut, eventBus, timer, dataSource } = createSut()

    dataSource.setGameStarted()
    sut.start()

    await timer.tick() // game-started

    dataSource.nextTick()
    await timer.tick() // game-tick

    expect(eventBus.totalCalls).toEqual(2)
    expect(eventBus.hasAllEventsInOrder(['game-started', 'game-tick'])).toBe(true)
  })

  test('Should not dispatch older events if first tick is not multiple events', async () => {
    const { sut, eventBus, timer, dataSource } = createSut()

    dataSource.setGameStarted(15)
    sut.start()

    await timer.tick() // game-tick

    dataSource.advanceToFutureTick(17)
    await timer.tick() // game-tick

    expect(eventBus.totalCalls).toEqual(2)
    expect(eventBus.hasAllEventsInOrder(['game-tick', 'game-tick'])).toBe(true)
  })
})
