import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber'

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
    BeforeAllScenarios(() => {})
    AfterAllScenarios(() => {})
    BeforeEachScenario(() => {})
    AfterEachScenario(() => {})

    Background(({ Given, And }) => {
      Given(`the application is running`, () => {})
      And(`I have one reminder configured:`, () => {})
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
