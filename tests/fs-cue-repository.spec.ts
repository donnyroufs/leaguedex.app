import { afterEach, describe, expect, test } from 'vitest'
import path from 'path'
import fs from 'fs/promises'

import { FileSystemCueRepository } from '../src/main/adapters/outbound/repositories/FileSystemCueRepository'
import { CueBuilder } from './CueBuilder'

describe('FIleSystemCueRepository', () => {
  const fsPath = path.join(process.cwd(), crypto.randomUUID())

  afterEach(async () => {
    await fs.rm(fsPath, { recursive: true, force: true })
  })

  test('if file does not exist it creates it', async () => {
    const sut = await FileSystemCueRepository.create(fsPath)

    const cue = new CueBuilder().build()

    await sut.save(cue)
    const filePath = path.join(fsPath, 'cues.json')
    const readFile = await fs.readFile(filePath, 'utf-8')

    expect(readFile).not.toBeUndefined()
  })

  test('should not replace _ in filename', async () => {
    const sut = await FileSystemCueRepository.create(fsPath)

    const cue = new CueBuilder().withText('test my apple').build()

    await sut.save(cue)

    const cues = await sut.all()
    const confirmation = cues.unwrap().at(-1)!

    expect(confirmation.audioUrl.fullPath).toContain('test_my_apple.mp3')
  })
})
