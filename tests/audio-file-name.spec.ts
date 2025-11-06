import { AudioFileName } from '@hexagon/AudioFileName'
import { describe, test, expect } from 'vitest'

describe.each([
  ['MP3', AudioFileName.createMP3],
  ['WAV', AudioFileName.createWAV]
])('AudioFileName - %s', (ext, createFn) => {
  const audioDir = '/test/audio'

  test('should create filename from text', () => {
    const result = createFn('Test Audio File')
    expect(result.fullPath(audioDir)).toBe(`/test/audio/test_audio_file.${ext.toLowerCase()}`)
  })

  test('should strip existing extensions', () => {
    const result = createFn(`test.${ext.toLowerCase()}`)
    expect(result.fullPath(audioDir)).toBe(`/test/audio/test.${ext.toLowerCase()}`)
  })

  test('should remove special characters', () => {
    const result = createFn('Test! @#$% File')
    expect(result.fullPath(audioDir)).toBe(`/test/audio/test_file.${ext.toLowerCase()}`)
  })

  test('should collapse multiple spaces', () => {
    const result = createFn('Test    Multiple   Spaces')
    expect(result.fullPath(audioDir)).toBe(`/test/audio/test_multiple_spaces.${ext.toLowerCase()}`)
  })

  test('should trim whitespace', () => {
    const result = createFn('  Test File  ')
    expect(result.fullPath(audioDir)).toBe(`/test/audio/test_file.${ext.toLowerCase()}`)
  })
})
