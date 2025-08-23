import { describe, expect, test, afterEach } from 'vitest'
import fs from 'fs/promises'
import path from 'path'

import { FakeReminderRepository } from '../src/main/adapters/outbound/repositories/FakeReminderRepository'
import { FileSystemReminderRepository } from '../src/main/adapters/outbound/repositories/FileSystemReminderRepository'
import { ReminderBuilder } from './ReminderBuilder'

const fsPath = path.join(process.cwd(), crypto.randomUUID())

const instances = [
  {
    name: 'FakeReminderRepository',
    create: () => new FakeReminderRepository(),
    cleanup: async () => {}
  },
  {
    name: 'FileSystemReminderRepository',
    create: () => FileSystemReminderRepository.create(fsPath),
    cleanup: async () => {
      await fs.rm(fsPath, { recursive: true, force: true })
    }
  }
] as const

describe.each(instances)('$name Contract Tests', (x) => {
  afterEach(async () => {
    await x.cleanup()
  })

  test('saves a reminder', async () => {
    const sut = await x.create()
    const reminder = new ReminderBuilder().build()

    const result = await sut.save(reminder)

    expect(result.isOk()).toBe(true)

    const reminders = await sut.all()
    expect(reminders.unwrap()).toEqual([reminder])
  })

  test('Does not remove previous reminders when saving a new one', async () => {
    const sut = await x.create()

    const reminder = new ReminderBuilder().withText('test').build()
    const reminder2 = new ReminderBuilder().build()

    await sut.save(reminder)
    await sut.save(reminder2)

    const reminders = await sut.all()

    expect(reminders.unwrap()).toEqual([reminder, reminder2])
  })

  test.todo('returns an error when saving a reminder fails')
  test.todo('overwrites a reminder if same id is used')

  test('removes a reminder', async () => {
    const sut = await x.create()
    const reminder = new ReminderBuilder().build()
    const reminder2 = new ReminderBuilder().build()

    await sut.save(reminder)
    await sut.save(reminder2)

    const result = await sut.remove(reminder.id)
    expect(result.isOk()).toBe(true)

    const reminders = await sut.all()

    expect(reminders.unwrap()).toEqual([reminder2])
  })
})
