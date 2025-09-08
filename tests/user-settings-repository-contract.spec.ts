import {
  FakeUserSettingsRepository,
  FileSystemUserSettingsRepository
} from 'src/main/adapters/outbound'
import { afterEach, describe, test, expect } from 'vitest'
import { TestUserSettingsBuilder } from './TestUserSettingsBuilder'
import path from 'path'
import fs from 'fs/promises'

const fsPath = path.join(process.cwd(), crypto.randomUUID())

const instances = [
  {
    name: 'FakeUserSettingsRepository',
    create: () => new FakeUserSettingsRepository(),
    cleanup: async () => {}
  },
  {
    name: 'FileSystemUserSettingsRepository',
    create: async () => FileSystemUserSettingsRepository.create(fsPath),
    cleanup: async () => {
      await fs.rm(fsPath, { recursive: true, force: true })
    }
  }
]

describe.each(instances)('$name Contract Tests', (x) => {
  afterEach(async () => {
    await x.cleanup()
  })

  test('Saves the user settings', async () => {
    const sut = await x.create()
    const volume = 0.5
    const settings = new TestUserSettingsBuilder().withVolume(volume).build()

    await sut.save(settings)

    const loaded = await sut.load()

    expect(loaded.isOk()).toBe(true)
    expect(loaded.unwrap().volume).toBe(volume)
  })

  // when we add more
  test.todo('Overwrites the settings')

  test('returns default settings if no settings available', async () => {
    const sut = await x.create()
    const loaded = await sut.load()

    expect(loaded.isOk()).toBe(true)
    expect(loaded.unwrap().volume).toBe(1)
  })
})
