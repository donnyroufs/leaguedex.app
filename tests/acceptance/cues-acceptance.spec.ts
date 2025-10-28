import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber'
import fs from 'fs/promises'
import { expect } from 'vitest'

import { CreateCueDto, IAppController } from '@hexagon/index'
import { createTestApp } from 'src/main/CompositionRoot'
import { EventBus, FakeCuePackRepository, NullLogger } from 'src/main/adapters/outbound'
import { FakeTimer } from 'tests/FakeTimer'
import { AudioSpy } from 'tests/AudioSpy'
import { FakeRiotClientDataSource } from 'tests/FakeRiotClientDataSource'

const feature = await loadFeature('tests/features/cues.feature')

type CueData = {
  text: string
  triggerType: 'interval' | 'oneTime' | 'event' | 'objective'
  value?: number
  interval?: number
  triggerAt?: number
  event?: string
  objective?: 'dragon' | 'baron' | 'grubs' | 'herald' | 'atakhan'
  beforeObjective?: number
}

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
    let app!: IAppController
    let timer: FakeTimer
    let audioPlayer: AudioSpy
    let eventBus: EventBus
    let dataSource: FakeRiotClientDataSource
    let cuePackRepository: FakeCuePackRepository

    async function createCue(data: CreateCueDto): Promise<string> {
      const packId = await app.createCuePack({ name: 'My Pack' })

      const cueData: CueData = {
        text: data.text,
        triggerType: data.triggerType
      }

      if (data.triggerType === 'interval' && data.interval) {
        cueData.interval = Number(data.interval)
      } else if (data.triggerType === 'oneTime' && data.triggerAt) {
        cueData.triggerAt = Number(data.triggerAt)
      } else if (data.triggerType === 'event' && data.event) {
        cueData.event = data.event
        cueData.value = data.value !== undefined ? Number(data.value) : undefined
      } else if (
        data.triggerType === 'objective' &&
        data.objective != null &&
        data.beforeObjective != null
      ) {
        cueData.objective = data.objective
        cueData.beforeObjective = Number(data.beforeObjective)
      }

      return app.addCue({ ...cueData, packId })
    }

    BeforeAllScenarios(async () => {
      timer = new FakeTimer()
      eventBus = new EventBus(new NullLogger())
      audioPlayer = new AudioSpy()
      dataSource = new FakeRiotClientDataSource()
      cuePackRepository = new FakeCuePackRepository()

      app = await createTestApp({
        timer,
        audioPlayer,
        eventBus,
        dataSource,
        cuePackRepository
      })
    })

    AfterAllScenarios(async () => {
      await app.stop()
      await fs.rm('tmpaudio', { recursive: true, force: true })
    })

    BeforeEachScenario(() => {})

    AfterEachScenario(async () => {
      timer.clear()
      eventBus.clear()
      audioPlayer.clear()
      cuePackRepository.clear()
      dataSource.reset()
    })

    Background(({ Given }) => {
      Given(`the application is running`, async () => {
        await app.start()
      })
    })

    Scenario(`No cue when no game is running`, ({ Given, When, Then, And }) => {
      Given(`I have a cue configured:`, async (_, [data]: CreateCueDto[]) => {
        const createdCueId = await createCue(data)

        const cues = await app.getCues()
        expect(cues).toHaveLength(1)
        expect(cues[0].id).toBe(createdCueId)
      })

      And(`we are not in a League of Legends match`, async () => {
        dataSource.endGame()
      })

      When(`{string} seconds pass`, async (_, seconds: string) => {
        await dataSource.tickMultipleTimes(timer, Number(seconds))
      })

      Then(`no audio should play`, () => {
        expect(audioPlayer.totalCalls).toBe(0)
      })
    })

    Scenario(`Repeating interval cue`, ({ Given, When, Then, And }) => {
      Given(`I have a cue configured:`, async (_, [data]: CreateCueDto[]) => {
        const createdCueId = await createCue(data)

        const cues = await app.getCues()
        expect(cues).toHaveLength(1)
        expect(cues[0].id).toBe(createdCueId)
      })

      And(`we are in a League of Legends match`, async () => {
        dataSource.addGameStartedEvent()
      })

      When(`{string} seconds pass in game time`, async (_, seconds: string) => {
        await dataSource.tickMultipleTimes(timer, Number(seconds))
      })

      Then(`I should hear the audio {string}`, async (_, audio: string) => {
        expect(audioPlayer.totalCalls).toBe(1)
        expect(audioPlayer.lastCalledWith).toContain(audio)
      })

      When(`another {string} seconds pass in game time`, async (_, seconds: string) => {
        await dataSource.tickMultipleTimes(timer, Number(seconds))
      })

      Then(`I should hear the audio {string} again`, async (_, audio: string) => {
        expect(audioPlayer.totalCalls).toBe(2)
        expect(audioPlayer.lastCalledWith).toContain(audio)
      })
    })

    Scenario(`One-time cue at specific time`, ({ Given, When, Then, And }) => {
      Given(`I have a cue configured:`, async (_, [data]: CreateCueDto[]) => {
        const createdCueId = await createCue(data)

        const cues = await app.getCues()
        expect(cues).toHaveLength(1)
        expect(cues[0].id).toBe(createdCueId)
      })

      And(`we are in a League of Legends match`, () => {
        dataSource.addGameStartedEvent()
      })

      When(`{string} seconds pass in game time`, async (_, seconds: string) => {
        await dataSource.tickMultipleTimes(timer, Number(seconds))
      })

      Then(`I should hear the audio {string}`, async (_, audio: string) => {
        expect(audioPlayer.totalCalls).toBe(1)
        expect(audioPlayer.lastCalledWith).toContain(audio)
      })

      When(`another {string} seconds pass in game time`, async (_, seconds: string) => {
        await dataSource.tickMultipleTimes(timer, Number(seconds))
      })

      Then(`I should not hear the audio "ward_river" again`, async () => {
        expect(audioPlayer.totalCalls).toBe(1)
      })
    })

    Scenario(`Cue on respawn event`, ({ Given, When, Then, And }) => {
      Given(`I have a cue configured:`, async (_, [data]: CreateCueDto[]) => {
        const createdCueId = await createCue(data)

        const cues = await app.getCues()
        expect(cues).toHaveLength(1)
        expect(cues[0].id).toBe(createdCueId)
      })

      And(`we are in a League of Legends match`, () => {
        dataSource.addGameStartedEvent()
      })

      When(`the player dies with a {string} seconds death timer`, async (_, deathTimer: string) => {
        dataSource.killPlayer(Number(deathTimer))
      })

      And(`{string} seconds have passed`, async (_, seconds: string) => {
        await dataSource.tickMultipleTimes(timer, Number(seconds))
      })

      Then(`I should hear the audio {string}`, async (_, audio: string) => {
        expect(audioPlayer.totalCalls).toBe(1)
        expect(audioPlayer.lastCalledWith).toContain(audio)
      })

      When(
        `the player dies again with a {string} seconds death timer`,
        async (_, deathTimer: string) => {
          dataSource.killPlayer(Number(deathTimer))
          await dataSource.tickMultipleTimes(timer, Number(deathTimer))
        }
      )

      Then(`I should hear the audio {string} again`, async (_, audio: string) => {
        expect(audioPlayer.totalCalls).toBe(2)
        expect(audioPlayer.lastCalledWith).toContain(audio)
      })
    })

    ScenarioOutline(`Cue before spawning objective`, ({ Given, When, Then, And }, variables) => {
      Given(`I have a cue configured:`, async (_, [data]: CreateCueDto[]) => {
        const transformedData = {
          ...data,
          text: replace(data.text, variables),
          objective: variables.objective,
          beforeObjective: Number(data.beforeObjective)
        }
        const createdCueId = await createCue(transformedData)

        const cues = await app.getCues()
        expect(cues).toHaveLength(1)
        expect(cues[0].id).toBe(createdCueId)
      })

      And(`we are in a League of Legends match`, () => {
        dataSource.addGameStartedEvent()
      })

      When(`"<time>" seconds pass in game time`, async () => {
        await dataSource.tickMultipleTimes(timer, Number(variables.time))
      })

      Then(`I should hear the audio "<objective>_spawn"`, () => {
        expect(audioPlayer.lastCalledWith).toContain(variables.objective)
        expect(audioPlayer.totalCalls).toBe(1)
      })

      When(`the <objective> has died at "<death_time>" seconds`, async () => {
        const matchTime = Number(variables.death_time) - Number(variables.time)
        await dataSource.tickMultipleTimes(timer, matchTime)
        dataSource.addObjectiveDeathEvent(variables.objective, Number(variables.death_time))
      })

      And(`"<next_time>" seconds pass in game time`, async () => {
        await dataSource.tickMultipleTimes(timer, Number(variables.next_time))
      })

      Then(`I should hear the audio "<objective>_spawn" again`, () => {
        expect(audioPlayer.lastCalledWith).toContain(variables.objective)
        expect(audioPlayer.totalCalls).toBe(2)
      })
    })

    ScenarioOutline(
      `Cue before spawning one-time objective`,
      ({ Given, When, Then, And }, variables) => {
        Given(`I have a cue configured:`, async (_, [data]: CreateCueDto[]) => {
          const transformedData = {
            ...data,
            text: replace(data.text, variables),
            objective: variables.objective,
            beforeObjective: Number(data.beforeObjective)
          }
          const createdCueId = await createCue(transformedData)

          const cues = await app.getCues()
          expect(cues).toHaveLength(1)
          expect(cues[0].id).toBe(createdCueId)
        })

        And(`we are in a League of Legends match`, () => {
          dataSource.addGameStartedEvent()
        })

        When(`"<time>" seconds pass in game time`, async () => {
          await dataSource.tickMultipleTimes(timer, Number(variables.time))
        })

        Then(`I should hear the audio "<objective>_spawn"`, () => {
          expect(audioPlayer.lastCalledWith).toContain(variables.objective)
          expect(audioPlayer.totalCalls).toBe(1)
        })
      }
    )

    // Probably add variable for both teams to be sure they both work
    Scenario(
      `Elder dragon spawns after team reaches 4 dragon kills`,
      ({ Given, When, Then, And }) => {
        Given(`I have a cue configured:`, async (_, [data]: CreateCueDto[]) => {
          const createdCueId = await createCue(data)

          const cues = await app.getCues()
          expect(cues).toHaveLength(1)
          expect(cues[0].id).toBe(createdCueId)
        })

        And(`we are in a League of Legends match`, () => {
          dataSource.addGameStartedEvent()
        })

        When(`the red team has killed 4 dragons`, async () => {
          await dataSource.tickMultipleTimes(timer, 300)

          await dataSource.tickMultipleTimes(timer, 4)
          dataSource.addDragonKilledEvent(305)
          await dataSource.nextTick(timer)

          await dataSource.tickMultipleTimes(timer, 300)
          dataSource.addDragonKilledEvent(610)
          await dataSource.nextTick(timer)

          await dataSource.tickMultipleTimes(timer, 300)
          dataSource.addDragonKilledEvent(915)
          await dataSource.nextTick(timer)

          await dataSource.tickMultipleTimes(timer, 300)
          dataSource.addDragonKilledEvent(1220)
          await dataSource.nextTick(timer)
        })

        And(`"360" seconds pass in game time`, async () => {
          await dataSource.tickMultipleTimes(timer, 360)
        })

        Then(`I should hear the audio "elder_dragon_spawn"`, () => {
          expect(audioPlayer.lastCalledWith).toContain('elder_dragon_spawn')
          expect(audioPlayer.totalCalls).toBe(5)
        })
      }
    )

    Scenario(`Cue on canon wave spawned event`, ({ Given, When, Then, And }) => {
      Given(`I have a cue configured:`, async (_, [data]: CreateCueDto[]) => {
        const createdCueId = await createCue(data)

        const cues = await app.getCues()
        expect(cues).toHaveLength(1)
        expect(cues[0].id).toBe(createdCueId)
      })

      And(`we are in a League of Legends match`, () => {
        dataSource.addGameStartedEvent()
      })

      When(`{string} seconds pass in game time`, async (_, seconds: string) => {
        // TODO: do we need to do this for other tests too?
        // Our spy is not smart enough to know on what game-tick it got called
        // so we need to go back 1 tick and expect that there was no call
        await dataSource.tickMultipleTimes(timer, Number(seconds) - 1)
        expect(audioPlayer.totalCalls).toBe(0)
        await dataSource.nextTick(timer)
      })

      Then(`I should hear the audio "canon_wave_spawned"`, () => {
        expect(audioPlayer.lastCalledWith).toContain('canon_wave_spawned')
      })

      When(`another {string} seconds pass in game time`, async (_, seconds: string) => {
        await dataSource.tickMultipleTimes(timer, Number(seconds))
      })

      Then(`I should hear the audio "canon_wave_spawned" again`, () => {
        expect(audioPlayer.lastCalledWith).toContain('canon_wave_spawned')
        expect(audioPlayer.totalCalls).toBe(2)
      })

      And(`another {string} seconds pass in game time`, async (_, seconds: string) => {
        await dataSource.tickMultipleTimes(timer, Number(seconds))
      })

      Then(`I should hear the cue again`, () => {
        expect(audioPlayer.lastCalledWith).toContain('canon_wave_spawned')
        expect(audioPlayer.totalCalls).toBe(3)
      })
    })

    Scenario(`Cue on low mana`, ({ Given, When, Then, And }) => {
      Given(`I have a cue configured:`, async (_, [data]: CreateCueDto[]) => {
        const createdCueId = await createCue(data)
        const cues = await app.getCues()

        console.log(cues)

        expect(cues).toHaveLength(1)
        expect(cues[0].id).toBe(createdCueId)
      })

      And(`we are in a League of Legends match`, () => {
        dataSource.addGameStartedEvent()
      })

      When(`we reach a mana value of {string}`, async (_, value: string) => {
        await dataSource.nextTick(timer)

        dataSource.setCurrentPlayerResourceStats({
          resourceType: 'MANA',
          resourceValue: Number(value),
          resourceMax: Number(value) + 100
        })

        dataSource.changeCurrentPlayerMana(Number(value))

        await dataSource.nextTick(timer)
      })

      Then(`I should hear the audio "low_mana"`, () => {
        expect(audioPlayer.lastCalledWith).toContain('low_mana')
        expect(audioPlayer.totalCalls).toBe(1)
      })
    })
  }
)

function replace(key: string, variables: Record<string, string>): string {
  return key.replace(/<([^>]+)>/g, (_, p1) => variables[p1] || '')
}
