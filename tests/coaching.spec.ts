import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber'
import { createApp } from '../src/main/app/CompositionRoot'
import { App } from '../src/main/app/App'

const feature = await loadFeature('tests/features/coaching.feature')

type DataTableReminder = {
  name: string
  triggerType: string
  triggerValue: number
  text: string
  audioFile: string
}

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

    BeforeAllScenarios(async () => {})
    AfterAllScenarios(() => {})

    BeforeEachScenario(async () => {
      app = createApp()
      await app.start()
    })

    AfterEachScenario(async () => {
      await app.stop()
    })

    Background(({ Given, And }) => {
      Given(`the application is running`, () => {})

      And(`I have one reminder configured:`, (_, data: DataTableReminder[]) => {})
    })

    Scenario(`No reminder when no game is running`, ({ When, Then, And }) => {
      And(`we are not in a League of Legends match`, () => {})
      When(`120 seconds pass`, () => {})
      Then(`no audio should play`, () => {})
    })

    Scenario(`Game detection activates reminders`, ({ Given, When, Then, And }) => {
      Given(`we are not in a League of Legends match at 0 seconds`, () => {})
      When(`a League of Legends match is detected`, () => {})
      Then(`the reminder system should be activated`, () => {})
      And(`reminders should start processing`, () => {})
    })

    Scenario(`Single time-based reminder works`, ({ When, Then, And }) => {
      And(`we are in a League of Legends match at 0 seconds`, () => {})
      When(`120 seconds pass in game time`, () => {})
      And(`we have entered laning phase`, () => {})
      Then(`I should hear the audio "reminder_map.mp3"`, () => {})
    })
  }
)
