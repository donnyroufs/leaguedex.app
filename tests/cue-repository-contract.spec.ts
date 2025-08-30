import { describe, expect, test, afterEach } from 'vitest'
import fs from 'fs/promises'
import path from 'path'

import { AudioFileName } from '@hexagon/AudioFileName'
import { FakeCueRepository, FileSystemCueRepository } from 'src/main/adapters/outbound'
import { CueBuilder } from './CueBuilder'

const fsPath = path.join(process.cwd(), crypto.randomUUID())

const instances = [
  {
    name: 'FakeCueRepository',
    create: () => new FakeCueRepository(),
    cleanup: async () => {}
  },
  {
    name: 'FileSystemCueRepository',
    create: () => FileSystemCueRepository.create(fsPath),
    cleanup: async () => {
      await fs.rm(fsPath, { recursive: true, force: true })
    }
  }
] as const

describe.each(instances)('$name Contract Tests', (x) => {
  afterEach(async () => {
    await x.cleanup()
  })

  test('saves a cue', async () => {
    const sut = await x.create()
    const cue = new CueBuilder().build()

    const result = await sut.save(cue)

    expect(result.isOk()).toBe(true)

    const cues = await sut.all()
    expect(cues.unwrap()).toEqual([cue])
  })

  test('Does not remove previous cues when saving a new one', async () => {
    const sut = await x.create()

    const cue = new CueBuilder().withText('test').build()
    const cue2 = new CueBuilder().build()

    await sut.save(cue)
    await sut.save(cue2)

    const cues = await sut.all()

    expect(cues.unwrap()).toEqual([cue, cue2])
  })

  test('serializes audioUrl correctly', async () => {
    const sut = await x.create()
    const cue = new CueBuilder().build()
    await sut.save(cue)
    const cues = await sut.all()
    const confirmation = cues.unwrap()[0]
    expect(confirmation.audioUrl).toBeDefined()
    expect(confirmation.audioUrl).toEqual(cue.audioUrl)
    expect(confirmation.audioUrl).toBeInstanceOf(AudioFileName)
  })

  test.todo('returns an error when saving a cue fails')
  test.todo('overwrites a cue if same id is used')

  test('removes a cue', async () => {
    const sut = await x.create()
    const cue = new CueBuilder().build()
    const cue2 = new CueBuilder().build()

    await sut.save(cue)
    await sut.save(cue2)

    const result = await sut.remove(cue.id)
    expect(result.isOk()).toBe(true)

    const cues = await sut.all()

    expect(cues.unwrap()).toEqual([cue2])
  })
})
