import { describe, expect, test, afterEach } from 'vitest'
import { FakeCuePackRepository } from 'src/main/adapters/outbound'
import { TestCuePackBuilder } from './TestCuePackBuilder'

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
    const cuePack2 = new TestCuePackBuilder().withName('My Pack 2').activate().build()

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
})
