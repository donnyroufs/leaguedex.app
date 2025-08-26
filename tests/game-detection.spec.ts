import { test, describe, expect } from 'vitest'
import { afterEach, beforeEach } from 'vitest'

import { GameDetectionService } from '../src/main/hexagon/GameDetectionService'
import { FakeTimer } from './FakeTimer'
import { EventBusSpy } from './EventBusSpy'
import { RiotLiveClientApi } from '../src/main/adapters/outbound/game-data'
import { GameTickEvent } from '../src/main/hexagon/events/GameTickEvent'
import { NullLogger } from '../src/main/adapters/outbound/NullLogger'
import { FakeRiotClientDataSource } from './FakeRiotClientDataSource'

describe('Game Detection Service', () => {
  let eventBus: EventBusSpy
  let timer: FakeTimer
  let dataSource: FakeRiotClientDataSource
  let gameDataProvider: RiotLiveClientApi
  let sut: GameDetectionService

  beforeEach(() => {
    eventBus = new EventBusSpy()
    timer = new FakeTimer()
    dataSource = new FakeRiotClientDataSource()
    gameDataProvider = new RiotLiveClientApi(dataSource)

    sut = new GameDetectionService(eventBus, gameDataProvider, timer, new NullLogger())
  })

  afterEach(() => {
    dataSource.reset()
  })

  test('should detect game start', async () => {
    dataSource.addGameStartedEvent()
    sut.start() // game-started
    await timer.tick()

    expect(eventBus.totalCalls).toEqual(1)
    expect(eventBus.hasAllEventsInOrder(['game-started'])).toBe(true)
  })

  test('should not detect game start when game-started event is not present', async () => {
    dataSource.reset()
    sut.start()
    await timer.tick()

    expect(eventBus.totalCalls).toEqual(0)
    expect(eventBus.events.length).toEqual(0)
  })

  test('should detect game end', async () => {
    dataSource.addGameStartedEvent()
    sut.start()
    await timer.tick() // game-started

    dataSource.nextTick()
    await timer.tick() // game-tick

    dataSource.nextTick()
    await timer.tick() // game-tick

    dataSource.endGame()
    await timer.tick() // game-ended

    expect(eventBus.totalCalls).toEqual(4)
    expect(
      eventBus.hasAllEventsInOrder(['game-started', 'game-tick', 'game-tick', 'game-ended'])
    ).toBe(true)
  })

  test('should detect game tick', async () => {
    dataSource.addGameStartedEvent()
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
    dataSource.beforeMatchStart()
    sut.start()
    await timer.tick() // no events

    expect(eventBus.totalCalls).toEqual(0)
    expect(eventBus.events.length).toEqual(0)
  })

  test('Should only emit game-tick on 1 after game-started', async () => {
    dataSource.addGameStartedEvent()
    sut.start()

    await timer.tick() // game-started

    dataSource.nextTick()
    await timer.tick() // game-tick

    expect(eventBus.totalCalls).toEqual(2)
    expect(eventBus.hasAllEventsInOrder(['game-started', 'game-tick'])).toBe(true)
  })

  test('Should not dispatch older events if first tick is not multiple events', async () => {
    dataSource.addGameStartedEvent()
    dataSource.advanceToFutureTick(15)
    sut.start()

    await timer.tick() // game-tick

    dataSource.advanceToFutureTick(17)
    await timer.tick() // game-tick

    expect(eventBus.totalCalls).toEqual(2)
    expect(eventBus.hasAllEventsInOrder(['game-tick', 'game-tick'])).toBe(true)
  })
})
