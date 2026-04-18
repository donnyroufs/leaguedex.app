import { FiringStateStore } from '@hexagon/triggers/FiringMode'
import { describe, test, expect, beforeEach } from 'vitest'

describe('FiringStateStore', () => {
  let store: FiringStateStore

  beforeEach(() => {
    store = new FiringStateStore()
  })

  describe('edge mode', () => {
    test('fires on false → true transition', () => {
      expect(store.shouldFire('cue-1', true, { mode: 'edge' }, 100)).toBe(true)
    })

    test('does not fire again while condition stays true', () => {
      store.shouldFire('cue-1', true, { mode: 'edge' }, 100)
      expect(store.shouldFire('cue-1', true, { mode: 'edge' }, 101)).toBe(false)
      expect(store.shouldFire('cue-1', true, { mode: 'edge' }, 150)).toBe(false)
    })

    test('re-arms after condition becomes false again', () => {
      store.shouldFire('cue-1', true, { mode: 'edge' }, 100)
      store.shouldFire('cue-1', false, { mode: 'edge' }, 110)
      expect(store.shouldFire('cue-1', true, { mode: 'edge' }, 120)).toBe(true)
    })

    test('does not fire when condition is false', () => {
      expect(store.shouldFire('cue-1', false, { mode: 'edge' }, 100)).toBe(false)
    })
  })

  describe('edgeWithCooldown mode', () => {
    const mode = { mode: 'edgeWithCooldown', cooldownSeconds: 60 } as const

    test('fires on first match', () => {
      expect(store.shouldFire('cue-1', true, mode, 100)).toBe(true)
    })

    test('does not fire within cooldown window', () => {
      store.shouldFire('cue-1', true, mode, 100)
      expect(store.shouldFire('cue-1', true, mode, 130)).toBe(false)
      expect(store.shouldFire('cue-1', true, mode, 159)).toBe(false)
    })

    test('fires again after cooldown expires even if condition stayed true', () => {
      store.shouldFire('cue-1', true, mode, 100)
      expect(store.shouldFire('cue-1', true, mode, 160)).toBe(true)
    })

    test('tracks different cues independently', () => {
      store.shouldFire('cue-a', true, mode, 100)
      expect(store.shouldFire('cue-b', true, mode, 110)).toBe(true)
    })
  })

  describe('oncePerGame mode', () => {
    const mode = { mode: 'oncePerGame' } as const

    test('fires on first match only', () => {
      expect(store.shouldFire('cue-1', true, mode, 100)).toBe(true)
      expect(store.shouldFire('cue-1', false, mode, 110)).toBe(false)
      expect(store.shouldFire('cue-1', true, mode, 120)).toBe(false)
    })
  })

  describe('clear', () => {
    test('resets state so cue can fire again', () => {
      store.shouldFire('cue-1', true, { mode: 'oncePerGame' }, 100)
      store.clear()
      expect(store.shouldFire('cue-1', true, { mode: 'oncePerGame' }, 100)).toBe(true)
    })
  })
})
