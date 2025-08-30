import fs from 'fs/promises'
import { expect } from 'vitest'

import { loadFeature, describeFeature, StepTest } from '@amiceli/vitest-cucumber'
import { CreateCueDto, IAppController, ICueDto, ICuePackDto } from '@hexagon/index'
import { EventBus, NullLogger, FakeCuePackRepository } from 'src/main/adapters/outbound'
import { createTestApp } from 'src/main/CompositionRoot'
import { AudioSpy } from 'tests/AudioSpy'
import { FakeRiotClientDataSource } from 'tests/FakeRiotClientDataSource'
import { FakeTimer } from 'tests/FakeTimer'
import { TextToSpeechSpy } from 'tests/TextToSpeechSpy'

type Typed<TContext> = Omit<StepTest, 'context'> & {
  context: TContext
}

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
    let app!: IAppController
    let timer: FakeTimer
    let audioPlayer: AudioSpy
    let eventBus: EventBus
    let dataSource: FakeRiotClientDataSource
    let cuePackRepository: FakeCuePackRepository
    let tts: TextToSpeechSpy

    async function createCue(data: CreateCueDto, packId: string): Promise<string> {
      const cueData: {
        text: string
        triggerType: 'interval' | 'oneTime' | 'event' | 'objective'
        interval?: number
        triggerAt?: number
        event?: string
        objective?: 'dragon' | 'baron' | 'grubs' | 'herald' | 'atakhan'
        beforeObjective?: number
      } = {
        text: data.text,
        triggerType: data.triggerType
      }

      if (data.triggerType === 'interval' && data.interval) {
        cueData.interval = Number(data.interval)
      } else if (data.triggerType === 'oneTime' && data.triggerAt) {
        cueData.triggerAt = Number(data.triggerAt)
      } else if (data.triggerType === 'event' && data.event) {
        cueData.event = data.event
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
      tts = new TextToSpeechSpy()

      app = await createTestApp({
        timer,
        audioPlayer,
        eventBus,
        dataSource,
        cuePackRepository,
        tts
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
      dataSource.reset()
      cuePackRepository.clear()
      tts.clear()
    })

    Background(({ Given }) => {
      Given(`the application is running`, async () => {
        await app.start()
      })
    })

    type Context = {
      pack: { id: string; name: string; cues: ICueDto[] }
    }

    Scenario(`Create a new cue pack`, ({ Given, When, Then, And, context }: Typed<Context>) => {
      Given(`I have no cue packs configured`, async () => {
        const packs = await app.getCuePacks()
        expect(packs).toHaveLength(0)
      })

      When(`I create a new cue pack called {string}`, async (_, name: string) => {
        await app.createCuePack({ name })
      })

      Then(`I should have a new cue pack called {string}`, async (_, name: string) => {
        const packs = await app.getCuePacks()

        expect(packs).toHaveLength(1)
        context.pack = packs[0]!
        expect(packs[0].name).toBe(name)
      })

      And(`it should be activated by default`, async () => {
        const activePack = await app.getActiveCuePack()
        expect(activePack!.name).toBe(context.pack.name)
      })

      And(`it should not have any cues`, async () => {
        expect(context.pack.cues).toHaveLength(0)
      })
    })

    type AddCueContext = {
      packId: string
      pack: ICuePackDto
    }

    Scenario(
      `Add a cue to the pack`,
      ({ Given, When, Then, And, context }: Typed<AddCueContext>) => {
        Given(`I have a cue pack called "My Pack"`, async () => {
          const packId = await app.createCuePack({ name: 'My Pack' })
          context.packId = packId
        })

        When(
          `I add a cue with the name {string} for the interval {string} seconds`,
          async (_, name: string, interval: string) => {
            await app.addCue({
              packId: context.packId,
              text: name,
              triggerType: 'interval',
              interval: parseInt(interval)
            })
          }
        )

        Then(
          `I should have a cue in the {string} cue pack with the name {string}`,
          async (_, packName: string, name: string) => {
            const packs = await app.getCuePacks()
            const pack = packs.find((p) => p.name === packName)
            expect(pack).toBeDefined()
            context.pack = pack!
            expect(pack!.cues).toHaveLength(1)
            expect(pack!.cues[0]!.text).toBe(name)
          }
        )

        And(`the cue should be triggered every {string} seconds`, (_, interval: string) => {
          expect(context.pack.cues[0]!.interval).toBe(parseInt(interval))
        })
      }
    )

    type SelectCuePackContext = {
      packs: { id: string; name: string }[]
    }

    Scenario(
      `Select a cue pack`,
      ({ Given, When, Then, And, context }: Typed<SelectCuePackContext>) => {
        Given(`I have two cue packs configured:`, async (_, dataTable: { name: string }[]) => {
          context.packs = []

          for (const pack of dataTable) {
            const id = await app.createCuePack({ name: pack.name })
            context.packs.push({ id, name: pack.name })
          }
        })

        When(`I select the {string} cue pack`, async (_, name: string) => {
          const packId = context.packs.find((p) => p.name === name)!.id
          await app.activateCuePack(packId)
        })

        Then(`I should have the {string} cue pack active`, async (_, name: string) => {
          const activePack = await app.getActiveCuePack()
          expect(activePack!.name).toBe(name)
        })

        And(`I should not have the {string} cue pack active`, async (_, name: string) => {
          const activePack = await app.getActiveCuePack()
          expect(activePack!.name).not.toBe(name)
        })
      }
    )

    type RemoveCuePackContext = {
      packs: { id: string; name: string }[]
    }

    Scenario(
      `Removing a cue pack`,
      ({ Given, When, Then, context, And }: Typed<RemoveCuePackContext>) => {
        Given(`I have two cue packs configured:`, async (_, dataTable: { name: string }[]) => {
          context.packs = []

          for (const pack of dataTable) {
            const id = await app.createCuePack({ name: pack.name })
            context.packs.push({ id, name: pack.name })
          }
        })

        When(`I remove the {string} cue pack`, async (_, name: string) => {
          const packId = context.packs.find((p) => p.name === name)!.id
          await app.removeCuePack(packId)
        })

        Then(`I should not have a cue pack called {string}`, async (_, name: string) => {
          const packs = await app.getCuePacks()

          expect(packs).toHaveLength(1)
          expect(packs[0]!.name).not.toBe(name)
        })

        And(`I should have the {string} cue pack active`, async (_, name: string) => {
          const activePack = await app.getActiveCuePack()
          expect(activePack!.name).toBe(name)
        })
      }
    )

    type ImportCuePackContext = {
      code: string
      packs: { id: string; name: string }[]
      newPackName: string
    }

    Scenario(
      `Import cue pack from encoded data`,
      ({ Given, When, Then, And, context }: Typed<ImportCuePackContext>) => {
        Given(
          `I have an encoded base64 string that contains a cue pack named {string} with the following cues:`,
          async (_, name: string, dataTable: CreateCueDto[]) => {
            const packId = await app.createCuePack({ name })

            for (const cue of dataTable) {
              await createCue(cue, packId)
            }

            // This one refers to my audio path, do we overwrite it? Or should the generation, handle the path?
            const code = `ewogICJuYW1lIjogIkEgc2hhcmVkIGN1ZSBwYWNrIiwKICAiY3VlcyI6IFsKICAgIHsKICAgICAgInRleHQiOiAiQ2hlY2sgbWluaW1hcCIsCiAgICAgICJ0cmlnZ2VyVHlwZSI6ICJpbnRlcnZhbCIsCiAgICAgICJpbnRlcnZhbCI6IDYwCiAgICB9CiAgXQp9`
            context.code = code
            context.newPackName = name
          }
        )

        When(`I import the cue pack using the encoded string`, async () => {
          await app.importPack(context.code)
        })

        Then(`I should have a new cue pack called {string}`, async (_, name: string) => {
          const packs = await app.getCuePacks()
          context.packs = packs

          expect(packs.some((pack) => pack.name === name)).toBe(true)
        })

        And(`all required audio files should be generated`, () => {
          expect(tts.totalCalls).toBe(2) // Initial one, and imported
          expect(tts.lastCalledWith).toBe('Check minimap')
        })

        And(`I should now have a total of 2 cue packs`, async () => {
          expect(context.packs).toHaveLength(2)
        })

        And(`The pack should be activated by default`, async () => {
          const activePack = await app.getActiveCuePack()
          expect(activePack!.name).toBe(context.newPackName)
        })
      }
    )

    type ExportCuePackContext = {
      code: string
      packId: string
    }

    Scenario(
      `Export cue pack to encoded data`,
      ({ Given, When, Then, context }: Typed<ExportCuePackContext>) => {
        Given(
          `I have a cue pack called {string} with the following cues:`,
          async (_, name: string, dataTable: CreateCueDto[]) => {
            const packId = await app.createCuePack({ name })
            context.packId = packId
            for (const cue of dataTable) {
              await createCue(cue, packId)
            }
          }
        )

        When(`I export the cue pack to encoded data`, async () => {
          const code = await app.exportPack(context.packId)
          context.code = code
        })

        Then(`I should have a base64 encoded string that contains the cue pack`, async () => {
          expect(context.code).toBeDefined()
          expect(async () => {
            await app.importPack(context.code)
          }).not.toThrow()
        })
      }
    )
  }
)
