import { expect, describe, test } from 'vitest'
import fs from 'fs/promises'

import { TextToSpeech } from '../src/main/adapters/outbound/TextToSpeech'
import { ElectronLogger } from '../src/main/adapters/outbound/ElectronLogger'

describe('Text to speech', () => {
  const audioDir = 'tmpaudio-' + crypto.randomUUID()

  test('should generate audio file and return the path and ensure directory exists', async () => {
    const tts = await TextToSpeech.create(ElectronLogger.createNull(), audioDir, 'darwin')
    const result = await tts.generate('Hello, world!')

    const stats = await fs.stat(result.getValue())
    await fs.rm(audioDir, { recursive: true, force: true })
    expect(stats.isFile()).toBe(true)
  })

  test('removes all special characters and lowercases the name, adds _ for every whitespace', async () => {
    const tts = await TextToSpeech.create(ElectronLogger.createNull(), audioDir, 'darwin')
    const result = await tts.generate('Hello, world!')
    const audioPath = result.getValue()
    const expectedFileName = 'hello_world'

    await fs.rm(audioDir, { recursive: true, force: true })
    expect(audioPath).toContain(expectedFileName)
  })

  test.todo('if the file already exists, it should not overwrite it')
})
