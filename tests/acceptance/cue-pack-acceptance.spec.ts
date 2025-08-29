import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber'

const feature = await loadFeature('tests/features/cue-pack.feature')

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

    Background(({ Given }) => {
      Given(`the application is running`, () => {})
    })

    Scenario(`Personal cue pack is active by default`, ({ Given, Then, And }) => {
      Given(`I have no cue packs configured`, () => {})
      Then(`I should have a personal cue pack`, () => {})
      And(`it should be active by default`, () => {})
      And(`it should be empty`, () => {})
    })

    Scenario(`Import cue pack from encoded data`, ({ Given, When, Then, And }) => {
      Given(
        `I have an encoded base64 string that contains a cue pack named "A shared cue pack" with the following cues:`,
        () => {}
      )
      And(`I have a personal cue pack`, () => {})
      When(`I import the cue pack using the encoded string`, () => {})
      Then(`I should have a new cue pack called "A shared cue pack"`, () => {})
      And(`all required audio files should be generated`, () => {})
      And(`I should now have a total of 2 cue packs`, () => {})
      And(`I can activate the imported cue pack`, () => {})
    })
  }
)
