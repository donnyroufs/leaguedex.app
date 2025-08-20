import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber'

import { expect } from 'vitest'
import { CreateReminderDto } from '../src/main/app/coaching'
import { App } from '../src/main/app/App'
import { createTestApp } from '../src/main/app/CompositionRoot'
import { FakeReminderRepository } from '../src/main/app/coaching/FakeReminderRepository'
import { FakeTimer } from './FakeTimer'
import { EventBus } from '../src/main/app/shared-kernel'
import { ElectronLogger } from '../src/main/app/shared-kernel/ElectronLogger'

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
    let audioSpy: AudioSpy
    let eventBus: EventBus

    BeforeAllScenarios(async () => {
      fakeReminderRepository = new FakeReminderRepository()
      timer = new FakeTimer()
      eventBus = new EventBus(ElectronLogger.createNull())
      app = await createTestApp({
        reminderRepository: fakeReminderRepository,
        timer,
        audioPlayer: audioSpy,
        eventBus
      })
    })

    AfterAllScenarios(async () => {
      await app.stop()
    })

    BeforeEachScenario(() => {})

    AfterEachScenario(() => {
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
      And(`we are not in a League of Legends match`, () => {
        let called = false

        eventBus.subscribe('game-tick', () => {
          called = true
        })

        timer.advanceTicks(5)

        expect(called).toBe(false)
      })

      When(`60 seconds pass`, async () => {
        await timer.advanceTicks(55)
      })

      Then(`no audio should play`, () => {
        expect(audioSpy.totalCalls).toBe(0)
      })
    })

    Scenario(`Repeatable time-based reminder works`, ({ When, Then, And }) => {
      And(`we are in a League of Legends match at 0 seconds`, async () => {
        let called = false

        eventBus.subscribe('game-tick', () => {
          called = true
        })

        await timer.advanceTicks(5)
        expect(called).toBe(true)
      })

      When(`60 seconds pass in game time`, () => {
        timer.advanceTicks(55)
      })

      // TODO: figure out how to get audio path from feature
      Then(`I should hear the audio "reminder_map.mp3"`, () => {
        expect(audioSpy.totalCalls).toBe(1)
        expect(audioSpy.lastCalledWith).toEqual('reminder_map.mp3')
      })

      And(`120 seconds pass in game time`, () => {
        timer.advanceTicks(60)
      })

      Then(`I should hear the audio "reminder_map.mp3" again`, () => {
        expect(audioSpy.totalCalls).toBe(2)
        expect(audioSpy.lastCalledWith).toEqual('reminder_map.mp3')
      })
    })
  }
)
