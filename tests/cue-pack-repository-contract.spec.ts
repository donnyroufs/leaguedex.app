import { describe, expect, test, afterEach } from 'vitest'
import { FakeCuePackRepository } from 'src/main/adapters/outbound'
import { TestCuePackBuilder } from './TestCuePackBuilder'
import { CueBuilder } from './CueBuilder'

const instances = [
  {
    name: 'FakeCuePackRepository',
    create: async () => new FakeCuePackRepository(),
    cleanup: async () => {}
  }
] as const

describe.each(instances)('$name Contract Tests', (x) => {
  afterEach(async () => {
    await x.cleanup()
  })

  test('saves a cue pack', async () => {
    const sut = await x.create()
    const cuePack1 = new TestCuePackBuilder().withName('My Pack').build()

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
})
