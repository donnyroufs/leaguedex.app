import { test, describe, expect } from 'vitest'

import { GameDetectionService } from '../src/main/app/shared-kernel/game-detection/GameDetectionService'
import { FakeTimer } from './FakeTimer'
import { EventBusSpy } from './EventBusSpy'
import { RiotApi } from '../src/main/app/shared-kernel'
import { RiotClientDataSourceStub } from './RiotClientDataSourceStub'

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

    dataSource.setGameTime(0)
    sut.start()
    await timer.nextTick()
    dataSource.setGameTime(1)
    await timer.nextTick()

    expect(eventBus.totalCalls).toEqual(1)
    expect(eventBus.lastEvent!.gameTick).toEqual(1)
    expect(eventBus.lastEventType).toEqual('game-started')
  })

  test('should detect game end', async () => {
    const { sut, eventBus, timer, dataSource } = createSut()

    dataSource.setGameTime(0)
    sut.start()

    await timer.nextTick()

    dataSource.setGameTime(1)
    await timer.nextTick()

    dataSource.setGameTime(0)
    await timer.nextTick()

    expect(eventBus.totalCalls).toEqual(2)
    expect(eventBus.lastEvent!.gameTick).toEqual(0)
    expect(eventBus.lastEventType).toEqual('game-ended')
  })

  test('should detect game tick', async () => {
    const { sut, eventBus, timer, dataSource } = createSut()

    dataSource.setGameTime(0)
    sut.start()

    dataSource.setGameTime(1)
    await timer.nextTick()

    dataSource.setGameTime(2)
    await timer.nextTick()

    expect(eventBus.totalCalls).toEqual(2)
    expect(eventBus.lastEvent!.gameTick).toEqual(2)
    expect(eventBus.lastEventType).toEqual('game-tick')
  })

  test('should not dispatch any events from riot api before game detection', async () => {
    const { sut, eventBus, timer, dataSource } = createSut()

    dataSource.shouldError()
    sut.start()
    await timer.nextTick()

    expect(eventBus.totalCalls).toEqual(0)
    expect(eventBus.lastEventType).toBeNull()
  })

  test('should dispatch game-ended event if riot api returns error after game detection', async () => {
    const { sut, eventBus, timer, dataSource } = createSut()

    dataSource.setGameTime(0)
    sut.start()

    dataSource.setGameTime(1)
    await timer.nextTick()

    dataSource.shouldError()
    await timer.nextTick()

    expect(eventBus.totalCalls).toEqual(2)
    expect(eventBus.lastEventType).toEqual('game-ended')
  })
})
