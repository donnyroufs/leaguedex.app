import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber'
import fs from 'fs/promises'
import { expect } from 'vitest'

import { CreateReminderDto } from '../src/main/app/coaching'
import { App } from '../src/main/app/App'
import { createTestApp } from '../src/main/app/CompositionRoot'
import { FakeReminderRepository } from '../src/main/app/coaching/FakeReminderRepository'
import { FakeTimer } from './FakeTimer'
import { EventBus } from '../src/main/app/shared-kernel'
import { ElectronLogger } from '../src/main/app/shared-kernel/ElectronLogger'
import { AudioSpy } from './AudioSpy'
import { RiotClientDataSourceStub } from './RiotClientDataSourceStub'
import { DummyElectronNotifier } from './DummyElectronNotifier'

const feature = await loadFeature('tests/features/coaching.feature')

describeFeature(
  feature,
  ({
    BeforeAllScenarios,
    AfterAllScenarios,
    BeforeEachScenario,
    AfterEachScenario,
    Background,
    Scenario
  }) => {
    let app!: App
    let fakeReminderRepository!: FakeReminderRepository
    let timer: FakeTimer
    let audioPlayer: AudioSpy
    let eventBus: EventBus
    let dataSource: RiotClientDataSourceStub
    let notifyElectron: DummyElectronNotifier

    async function advanceGameTicks(ticks: number): Promise<void> {
      for (let i = 0; i < ticks; i++) {
        dataSource.tick()
        await timer.tick()
      }
    }

    BeforeAllScenarios(async () => {
      fakeReminderRepository = new FakeReminderRepository()
      timer = new FakeTimer()
      eventBus = new EventBus(ElectronLogger.createNull())
      audioPlayer = new AudioSpy()
      dataSource = new RiotClientDataSourceStub()
      notifyElectron = new DummyElectronNotifier()

      app = await createTestApp({
        reminderRepository: fakeReminderRepository,
        timer,
        audioPlayer,
        eventBus,
        dataSource,
        notifyElectron
      })
    })

    AfterAllScenarios(async () => {
      await app.stop()
      await fs.rm('tmpaudio', { recursive: true, force: true })
    })

    BeforeEachScenario(() => {})

    AfterEachScenario(async () => {
      fakeReminderRepository.clear()
    })

    Background(({ Given, And }) => {
      Given(`the application is running`, async () => {
        await app.start()
      })

      And(`I have one reminder configured:`, async (_, [data]: CreateReminderDto[]) => {
        const createdReminderId = await app.addReminder({
          interval: Number(data.interval),
          text: data.text
        })

        const reminders = await app.getReminders()

        expect(reminders).toHaveLength(1)
        expect(reminders[0].id).toBe(createdReminderId)
      })
    })

    Scenario(`No reminder when no game is running`, ({ When, Then, And }) => {
      And(`we are not in a League of Legends match`, async () => {
        dataSource.simulateNull()
        await advanceGameTicks(1)
      })

      When(`60 seconds pass`, async () => {
        await advanceGameTicks(60)
      })

      Then(`no audio should play`, () => {
        expect(audioPlayer.totalCalls).toBe(0)
      })
    })

    Scenario(`Repeatable time-based reminder works`, ({ When, Then, And }) => {
      And(`we are in a League of Legends match at 0 seconds`, async () => {
        dataSource.setGameStarted()
        await advanceGameTicks(1)
      })

      When(`60 seconds pass in game time`, async () => {
        await advanceGameTicks(59)
      })

      Then(`I should hear the audio {string}`, async (_, audioName: string) => {
        expect(audioPlayer.totalCalls).toBe(1)
        expect(audioPlayer.lastCalledWith).toContain(audioName)
      })

      And(`120 seconds pass in game time`, async () => {
        await advanceGameTicks(60)
      })

      Then(`I should hear the audio {string} again`, async (_, audioName: string) => {
        expect(audioPlayer.totalCalls).toBe(2)
        expect(audioPlayer.lastCalledWith).toContain(audioName)
      })
    })
  }
)
