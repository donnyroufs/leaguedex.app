import { describe, expect, test, afterEach } from 'vitest'
import { FakeCuePackRepository } from 'src/main/adapters/outbound'
import { TestCuePackBuilder } from './TestCuePackBuilder'
import { CueBuilder } from './CueBuilder'
import { FileSystemCuePackRepository } from 'src/main/adapters/outbound/repositories/FileSystemCuePackRepository'
import path from 'path'
import fs from 'fs/promises'

const fsPath = path.join(process.cwd(), crypto.randomUUID())

const instances = [
  {
    name: 'FakeCuePackRepository',
    create: async () => new FakeCuePackRepository(),
    cleanup: async () => {}
  },
  {
    name: 'FileSystemCuePackRepository',
    create: async () => FileSystemCuePackRepository.create(fsPath),
    cleanup: async () => {
      await fs.rm(fsPath, { recursive: true, force: true })
    }
  }
] as const

describe.each(instances)('$name Contract Tests', (x) => {
  afterEach(async () => {
    await x.cleanup()
  })

  test('saves a cue pack', async () => {
    const sut = await x.create()
    const cuePack1 = new TestCuePackBuilder()
      .withName('My Pack')
      .withCues([new CueBuilder().withText('My cue').withValue(100).withEndTime(1000).build()])
      .build()

    await sut.save(cuePack1)

    const cuePacks = await sut.all()

    expect(cuePacks.unwrap()).toEqual([cuePack1])
  })

  test('returns the active cue pack', async () => {
    const sut = await x.create()
    const cuePack1 = new TestCuePackBuilder().withName('My Pack').build()
    const cuePack2 = new TestCuePackBuilder().withName('My Pack 2').isActive().build()

    await sut.save(cuePack1)
    await sut.save(cuePack2)

    const activePack = await sut.active()

    expect(activePack.unwrap()).toEqual(cuePack2)
  })

  test('loads a cue pack', async () => {
    const sut = await x.create()
    const cuePack1 = new TestCuePackBuilder().withName('My Pack').build()

    await sut.save(cuePack1)

    const loadedPack = await sut.load(cuePack1.id)

    expect(loadedPack.unwrap()).toEqual(cuePack1)
  })

  test('removes a cue from the active cue pack', async () => {
    const sut = await x.create()
    const cue1 = new CueBuilder().withText('My cue').build()
    const cue2 = new CueBuilder().withText('My cue 2').build()
    const cuePack1 = new TestCuePackBuilder()
      .isActive()
      .withName('My Pack')
      .withCues([cue1, cue2])
      .build()

    await sut.save(cuePack1)
    await sut.removeCue(cue1.id)

    const cuePacks = await sut.all()
    const pack = cuePacks.unwrap()![0]!

    expect(pack.cues).toHaveLength(1)
    expect(pack.cues[0]!.id).toEqual(cue2.id)
    expect(pack.cues[0]!.text).toEqual(cue2.text)
  })

  test('removes a cue pack', async () => {
    const sut = await x.create()
    const cuePack1 = new TestCuePackBuilder().withName('My Pack').build()
    const cuePack2 = new TestCuePackBuilder().withName('My Pack 2').build()

    await sut.save(cuePack1)
    await sut.save(cuePack2)
    await sut.remove(cuePack1.id)

    const cuePacks = await sut.all()
    expect(cuePacks.unwrap()).toHaveLength(1)
    expect(cuePacks.unwrap()[0]!.id).toEqual(cuePack2.id)
  })

  test('saves and loads a cue pack with support-item-upgraded event', async () => {
    const sut = await x.create()
    const cue = new CueBuilder()
      .withText('Support item upgraded')
      .asEvent('support-item-upgraded')
      .build()
    const cuePack = new TestCuePackBuilder().withCues([cue]).build()

    await sut.save(cuePack)
    const loaded = await sut.load(cuePack.id)

    expect(loaded.unwrap()?.cues[0]?.event).toBe('support-item-upgraded')
  })
})
