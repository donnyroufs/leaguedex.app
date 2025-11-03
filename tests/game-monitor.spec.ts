import { describe, test, expect, beforeEach } from 'vitest'
import { GameMonitor } from '../src/main/hexagon/GameMonitor'
import { NullLogger } from '../src/main/adapters/outbound'
import { EventBusSpy } from './EventBusSpy'

import { FakeTimer } from './FakeTimer'
import { StubGameDataProvider } from './StubGameDataProvider'

async function tick(timer: FakeTimer, gameDataProvider: StubGameDataProvider): Promise<void> {
  gameDataProvider.tick()
  await timer.tick()
}

describe('Game Monitor', () => {
  let sut: GameMonitor
  let timer: FakeTimer
  let eventBus: EventBusSpy
  let gameDataProvider: StubGameDataProvider

  beforeEach(() => {
    eventBus = new EventBusSpy()
    timer = new FakeTimer()
    gameDataProvider = new StubGameDataProvider()
    sut = new GameMonitor(new NullLogger(), timer, eventBus, gameDataProvider)
  })

  test('Does not publish a game tick event if game has not started', async () => {
    await sut.start()
    await tick(timer, gameDataProvider)
    expect(eventBus.totalCalls).toBe(0)
  })

  test('Publishes game started event when game has started', async () => {
    gameDataProvider.setStarted()
    await sut.start()
    await tick(timer, gameDataProvider)
    expect(eventBus.hasEvent('game-started')).toBe(true)
  })

  test('Only publishes game started event once', async () => {
    gameDataProvider.setStarted()
    await sut.start()
    await tick(timer, gameDataProvider)
    await tick(timer, gameDataProvider)
    await tick(timer, gameDataProvider)
    expect(eventBus.hasEventOnce('game-started')).toBe(true)
  })

  test('Publishes game tick event every 1s when game has started', async () => {
    gameDataProvider.setStarted()

    await sut.start()

    await tick(timer, gameDataProvider)
    await tick(timer, gameDataProvider)

    expect(eventBus.totalCalls).toBe(3)
    expect(eventBus.hasAllEvents(['game-started', 'game-tick', 'game-tick'])).toBe(true)
  })

  test('Publishes game stopped event when game has stopped', async () => {
    gameDataProvider.setStarted()
    await sut.start()
    await tick(timer, gameDataProvider)
    gameDataProvider.setStopped()
    await tick(timer, gameDataProvider)
    expect(eventBus.hasEvent('game-stopped')).toBe(true)
  })

  test('Publishes game event even if we started the monitor later', async () => {
    gameDataProvider.setStarted(30) // 30 seconds into the game already
    await sut.start()

    await tick(timer, gameDataProvider)
    await tick(timer, gameDataProvider)

    expect(eventBus.totalCalls).toBe(3)
    expect(eventBus.hasAllEvents(['game-started', 'game-tick', 'game-tick'])).toBe(true)
  })

  test('Does not stop looking for an active game after a game has been finished', async () => {
    gameDataProvider.setStarted(0)
    await sut.start()

    await tick(timer, gameDataProvider)
    await tick(timer, gameDataProvider)

    gameDataProvider.setStopped()

    await tick(timer, gameDataProvider)

    expect(eventBus.totalCalls).toBe(4)
    expect(eventBus.hasEvent('game-stopped')).toBe(true)

    eventBus.clear()
    gameDataProvider.setStarted(0)

    await tick(timer, gameDataProvider)

    expect(eventBus.totalCalls).toBe(2)
  })

  test.todo('Passes the computed game state to the game tick event')

  // Later optimization
  test.todo('Polls every 5s until game is started')
})
