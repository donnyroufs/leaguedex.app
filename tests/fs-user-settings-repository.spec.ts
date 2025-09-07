import { describe, test, expect, afterEach } from 'vitest'
import { FileSystemUserSettingsRepository } from 'src/main/adapters/outbound'
import path from 'path'
import fs from 'fs/promises'
import { TestUserSettingsBuilder } from './TestUserSettingsBuilder'

const fsPath = path.join(process.cwd(), crypto.randomUUID())

describe('FS User Settings Repository', () => {
  afterEach(async () => {
    await fs.rm(fsPath, { recursive: true, force: true })
  })

  test('if file does not exist it creates it', async () => {
    const sut = await FileSystemUserSettingsRepository.create(fsPath)
    const result = await sut.save(new TestUserSettingsBuilder().withVolume(0.5).build())
    const filePath = path.join(fsPath, 'user-settings.json')
    const readFile = await fs.readFile(filePath, 'utf-8')

    expect(result.isOk()).toBe(true)
    expect(readFile).not.toBeUndefined()
  })
})
