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
    Scenario,
    ScenarioOutline
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
        const createdReminderId = await app.addReminder({
          interval: Number(data.interval),
          text: data.text,
          isRepeating: true
        })

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

    ScenarioOutline(`Repeating Reminders`, ({ Given, When, Then, And }, variables) => {
      Given(
        `I have a <interval> second repeating reminder configured:`,
        async (_, [data]: CreateReminderDto[]) => {
          const createdReminderId = await app.addReminder({
            interval: Number(variables.interval),
            text: data.text,
            isRepeating: true
          })

          const reminders = await app.getReminders()
          expect(reminders).toHaveLength(1)
          expect(reminders[0].id).toBe(createdReminderId)
        }
      )

      And(`we are in a League of Legends match at 0 seconds`, async () => {
        dataSource.setGameStarted()
      })

      When(`"<interval>" seconds pass in game time`, async () => {
        await advanceGameTicks(Number(variables.interval))
      })

      Then(`I should hear the audio "check_minimap"`, async () => {
        expect(audioPlayer.totalCalls).toBe(1)
        expect(audioPlayer.lastCalledWith).toContain('check_minimap')
      })

      And(`another "<interval>" seconds pass in game time`, async () => {
        await advanceGameTicks(Number(variables.interval))
      })

      Then(`I should hear the audio "check_minimap" again`, async () => {
        expect(audioPlayer.totalCalls).toBe(2)
        expect(audioPlayer.lastCalledWith).toContain('check_minimap')
      })
    })

    ScenarioOutline(`One-Time Reminders`, ({ Given, When, Then, And }, variables) => {
      Given(
        `I have a <interval> second one-time reminder configured:`,
        async (_, [data]: CreateReminderDto[]) => {
          const createdReminderId = await app.addReminder({
            interval: Number(variables.interval),
            text: data.text,
            isRepeating: false
          })

          const reminders = await app.getReminders()

          expect(reminders).toHaveLength(1)
          expect(reminders[0].id).toBe(createdReminderId)
        }
      )

      And(`we are in a League of Legends match at 0 seconds`, () => {
        dataSource.setGameStarted()
      })

      When(`"<interval>" seconds pass in game time`, async () => {
        await advanceGameTicks(Number(variables.interval))
      })

      Then(`I should hear the audio "check_minimap"`, async () => {
        expect(audioPlayer.totalCalls).toBe(1)
        expect(audioPlayer.lastCalledWith).toContain('check_minimap')
      })

      And(`another "<interval>" seconds pass in game time`, async () => {
        await advanceGameTicks(Number(variables.interval))
      })

      Then(`I should not hear the audio "check_minimap" again`, async () => {
        expect(audioPlayer.totalCalls).toBe(1)
      })
    })
  }
)
