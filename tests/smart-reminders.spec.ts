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

const feature = await loadFeature('tests/features/smart-reminders.feature')

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

    async function createReminder(data: CreateReminderDto): Promise<string> {
      const reminderData: {
        text: string
        triggerType: 'interval' | 'oneTime' | 'event'
        interval?: number
        triggerAt?: number
        event?: string
      } = {
        text: data.text,
        triggerType: data.triggerType
      }

      if (data.triggerType === 'interval' && data.interval) {
        reminderData.interval = Number(data.interval)
      } else if (data.triggerType === 'oneTime' && data.triggerAt) {
        reminderData.triggerAt = Number(data.triggerAt)
      } else if (data.triggerType === 'event' && data.event) {
        reminderData.event = data.event
      }

      return app.addReminder(reminderData)
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
      audioPlayer.clear()
      fakeReminderRepository.clear()
    })

    Background(({ Given }) => {
      Given(`the application is running`, async () => {
        await app.start()
      })
    })

    Scenario(`No reminder when no game is running`, ({ Given, When, Then, And }) => {
      Given(`I have a reminder configured:`, async (_, [data]: CreateReminderDto[]) => {
        const createdReminderId = await createReminder(data)

        const reminders = await app.getReminders()
        expect(reminders).toHaveLength(1)
        expect(reminders[0].id).toBe(createdReminderId)
      })

      And(`we are not in a League of Legends match`, async () => {
        dataSource.simulateNull()
      })

      When(`{string} seconds pass`, async (_, seconds: string) => {
        await advanceGameTicks(Number(seconds))
      })

      Then(`no audio should play`, () => {
        expect(audioPlayer.totalCalls).toBe(0)
      })
    })

    Scenario(`Repeating interval reminder`, ({ Given, When, Then, And }) => {
      Given(`I have a reminder configured:`, async (_, [data]: CreateReminderDto[]) => {
        const createdReminderId = await createReminder(data)

        const reminders = await app.getReminders()
        expect(reminders).toHaveLength(1)
        expect(reminders[0].id).toBe(createdReminderId)
      })

      And(`we are in a League of Legends match`, async () => {
        dataSource.setGameStarted()
      })

      When(`{string} seconds pass in game time`, async (_, seconds: string) => {
        await advanceGameTicks(Number(seconds))
      })

      Then(`I should hear the audio "check_minimap"`, async () => {
        expect(audioPlayer.totalCalls).toBe(1)
        expect(audioPlayer.lastCalledWith).toContain('check_minimap')
      })

      When(`another {string} seconds pass in game time`, async (_, seconds: string) => {
        await advanceGameTicks(Number(seconds))
      })

      Then(`I should hear the audio "check_minimap" again`, async () => {
        expect(audioPlayer.totalCalls).toBe(2)
        expect(audioPlayer.lastCalledWith).toContain('check_minimap')
      })
    })

    Scenario(`One-time reminder at specific time`, ({ Given, When, Then, And }) => {
      Given(`I have a reminder configured:`, async (_, [data]: CreateReminderDto[]) => {
        const createdReminderId = await createReminder(data)

        const reminders = await app.getReminders()
        expect(reminders).toHaveLength(1)
        expect(reminders[0].id).toBe(createdReminderId)
      })

      And(`we are in a League of Legends match`, () => {
        dataSource.setGameStarted()
      })

      When(`{string} seconds pass in game time`, async (_, seconds: string) => {
        await advanceGameTicks(Number(seconds))
      })

      Then(`I should hear the audio "ward_river"`, async () => {
        expect(audioPlayer.totalCalls).toBe(1)
        expect(audioPlayer.lastCalledWith).toContain('ward_river')
      })

      When(`another {string} seconds pass in game time`, async (_, seconds: string) => {
        await advanceGameTicks(Number(seconds))
      })

      Then(`I should not hear the audio "ward_river" again`, async () => {
        expect(audioPlayer.totalCalls).toBe(1)
      })
    })

    Scenario(`Reminder on death event`, ({ Given, When, Then, And }) => {
      Given(`I have a reminder configured:`, async (_, [data]: CreateReminderDto[]) => {
        const createdReminderId = await createReminder(data)

        const reminders = await app.getReminders()
        expect(reminders).toHaveLength(1)
        expect(reminders[0].id).toBe(createdReminderId)
      })

      And(`we are in a League of Legends match`, () => {
        dataSource.setGameStarted()
      })

      When(`{string} seconds pass in game time`, async (_, seconds: string) => {
        await advanceGameTicks(Number(seconds))
      })

      Then(`I should hear the audio "play_safer_now"`, async () => {
        expect(audioPlayer.totalCalls).toBe(1)
      })

      When(`another {string} seconds pass in game time`, async (_, seconds: string) => {
        await advanceGameTicks(Number(seconds))
      })

      Then(`I should hear the audio "play_safer_now" again`, async () => {
        expect(audioPlayer.totalCalls).toBe(1)
      })
    })
  }
)
