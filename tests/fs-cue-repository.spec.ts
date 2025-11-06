import { afterEach, describe, expect, test } from 'vitest'
import path from 'path'
import fs from 'fs/promises'

import { TestCuePackBuilder } from './TestCuePackBuilder'
import { FileSystemCuePackRepository } from '../src/main/adapters/outbound/repositories'
import { CueBuilder } from './CueBuilder'

describe('FIleSystemCuePackRepository', () => {
  const fsPath = path.join(process.cwd(), crypto.randomUUID())

  afterEach(async () => {
    await fs.rm(fsPath, { recursive: true, force: true })
  })

  test('if file does not exist it creates it', async () => {
    const sut = await FileSystemCuePackRepository.create(fsPath)

    const cuePack = new TestCuePackBuilder()
      .withName('test my apple')
      .withCues([new CueBuilder().build()])
      .build()

    await sut.save(cuePack)
    const filePath = path.join(fsPath, 'cue-packs.json')
    const readFile = await fs.readFile(filePath, 'utf-8')

    expect(readFile).not.toBeUndefined()
  })

  test('should not replace _ in filename', async () => {
    const sut = await FileSystemCuePackRepository.create(fsPath)

    const cuePack = new TestCuePackBuilder()
      .withName('test my apple')
      .withCues([new CueBuilder().withText('test my apple').build()])
      .build()

    await sut.save(cuePack)

    const cues = await sut.all()
    const confirmation = cues.unwrap().at(-1)!

    const audioDir = '/test/audio'
    expect(confirmation.cues.at(-1)!.audioUrl.fullPath(audioDir)).toContain('test_my_apple.mp3')
  })
})
