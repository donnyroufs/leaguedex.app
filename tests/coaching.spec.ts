import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber'

import { expect } from 'vitest'
import { CreateReminderDto } from '../src/main/app/coaching'
import { App } from '../src/main/app/App'
import { createTestApp } from '../src/main/app/CompositionRoot'
import { FakeReminderRepository } from '../src/main/app/coaching/FakeReminderRepository'

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

    BeforeAllScenarios(async () => {
      fakeReminderRepository = new FakeReminderRepository()
      app = await createTestApp({
        reminderRepository: fakeReminderRepository
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
      And(`we are not in a League of Legends match`, () => {})
      When(`120 seconds pass`, () => {})
      Then(`no audio should play`, () => {})
    })

    Scenario(`Single time-based reminder works`, ({ When, Then, And }) => {
      And(`we are in a League of Legends match at 0 seconds`, () => {})
      When(`60 seconds pass in game time`, () => {})
      Then(`I should hear the audio "reminder_map.mp3"`, () => {})
    })
  }
)
