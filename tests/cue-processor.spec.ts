import { describe, test, expect, beforeEach } from 'vitest'
import { CueBuilder } from './CueBuilder'
import { CueProcessor } from '@hexagon/CueProcessor'
import { AudioSpy } from './AudioSpy'
import { AudioPlayerFake } from './AudioPlayerFake'
import { LoggerStub } from './LoggerSpy'
import { UserSettingsRepositoryDummy } from './UserSettingsRepositoryDummy'

describe('CueProcessor', () => {
  let processor: CueProcessor
  let audioSpy: AudioSpy
  let audioFake: AudioPlayerFake
  let logger: LoggerStub
  let userSettingsRepo: UserSettingsRepositoryDummy
  const audioDir = '/test/audio'

  beforeEach(() => {
    audioSpy = new AudioSpy()
    audioFake = new AudioPlayerFake()
    logger = new LoggerStub()
    userSettingsRepo = new UserSettingsRepositoryDummy()

    processor = new CueProcessor(audioSpy, logger, userSettingsRepo, audioDir)
  })

  test('processes cues in FIFO order', async () => {
    const cue1 = new CueBuilder().withText('first').build()
    const cue2 = new CueBuilder().withText('second').build()
    const cue3 = new CueBuilder().withText('third').build()

    processor.enqueue(cue1)
    processor.enqueue(cue2)
    processor.enqueue(cue3)

    await waitForProcessing()

    expect(audioSpy.calls[0]).toContain('first')
    expect(audioSpy.calls[1]).toContain('second')
    expect(audioSpy.calls[2]).toContain('third')
    expect(audioSpy.totalCalls).toBe(3)
  })

  test('enqueue does not block', () => {
    const cue = new CueBuilder().build()
    const start = Date.now()

    processor.enqueue(cue)

    const duration = Date.now() - start
    expect(duration).toBeLessThan(10)
  })

  test('continues processing if one cue fails', async () => {
    const cue1 = new CueBuilder().withText('first').build()
    const cue2 = new CueBuilder().withText('second').build()
    const cue3 = new CueBuilder().withText('third').build()

    const failingProcessor = new CueProcessor(audioFake, logger, userSettingsRepo, audioDir)

    audioFake.failNext()

    failingProcessor.enqueue(cue1)
    failingProcessor.enqueue(cue2)
    failingProcessor.enqueue(cue3)

    audioFake.resolveAll()
    await waitForProcessing()

    expect(audioFake.totalCalls).toBe(3)
  })

  test('stops processing queue after clear', async () => {
    const cue1 = new CueBuilder().withText('first').build()
    const cue2 = new CueBuilder().withText('second').build()
    const cue3 = new CueBuilder().withText('third').build()

    const clearProcessor = new CueProcessor(audioFake, logger, userSettingsRepo, audioDir)

    clearProcessor.enqueue(cue1)
    clearProcessor.enqueue(cue2)
    clearProcessor.enqueue(cue3)

    await wait(10)
    clearProcessor.clear()
    audioFake.resolveAll()

    await wait(50)

    expect(audioFake.totalCalls).toBe(1)
  })

  test('clear removes all pending cues from queue', async () => {
    const cue1 = new CueBuilder().withText('first').build()
    const cue2 = new CueBuilder().withText('second').build()
    const cue3 = new CueBuilder().withText('third').build()

    const clearProcessor = new CueProcessor(audioFake, logger, userSettingsRepo, audioDir)

    clearProcessor.enqueue(cue1)
    clearProcessor.enqueue(cue2)
    clearProcessor.enqueue(cue3)

    await wait(10)
    clearProcessor.clear()
    audioFake.resolveAll()

    await wait(50)

    expect(audioFake.totalCalls).toBeLessThan(3)
  })
})

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function waitForProcessing(): Promise<void> {
  return wait(100)
}
