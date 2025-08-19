import { afterEach, describe, expect, test } from 'vitest'
import path from 'path'
import fs from 'fs/promises'

import { FileSystemReminderRepository } from '../src/main/app/coaching'
import { ReminderBuilder } from './ReminderBuilder'

describe('FileSystemReminderRepository', () => {
  const fsPath = path.join(process.cwd(), crypto.randomUUID())

  afterEach(async () => {
    await fs.rm(fsPath, { recursive: true, force: true })
  })

  test('if file does not exist it creates it', async () => {
    const sut = await FileSystemReminderRepository.create(fsPath)

    const reminder = new ReminderBuilder().build()

    await sut.save(reminder)
    const filePath = path.join(fsPath, 'reminders.json')
    const readFile = await fs.readFile(filePath, 'utf-8')

    expect(readFile).not.toBeUndefined()
  })
})
