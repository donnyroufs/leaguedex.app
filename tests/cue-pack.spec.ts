import { CuePack } from '@hexagon/CuePack'
import { describe, test, expect } from 'vitest'
import { CueBuilder } from './CueBuilder'

describe('Cue Pack', () => {
  test('Should create a new cue pack with no cues', () => {
    const pack = CuePack.create('My Pack')

    expect(pack.name).toBe('My Pack')
    expect(pack.cues).toHaveLength(0)
  })

  test('Should activate the pack', () => {
    const pack = CuePack.create('My Pack')

    expect(pack.isActive).toBe(false)

    pack.activate()
  })

  test('Should deactivate the pack', () => {
    const pack = CuePack.create('My Pack')

    expect(pack.isActive).toBe(false)

    pack.deactivate()
  })

  test('Should add a cue to the pack', () => {
    const pack = CuePack.create('My Pack')
    const cue = new CueBuilder().withText('My cue').build()

    pack.add(cue)

    expect(pack.cues).toHaveLength(1)
    expect(pack.cues[0]).toEqual(cue)
  })

  test('Should remove a cue from the pack', () => {
    const pack = CuePack.create('My Pack')
    const cue = new CueBuilder().withText('My cue').build()
    const cue2 = new CueBuilder().withText('My cue 2').build()

    pack.add(cue)
    pack.add(cue2)

    pack.remove(cue.id)

    expect(pack.cues).toHaveLength(1)
    expect(pack.cues[0]).toEqual(cue2)
  })
})
