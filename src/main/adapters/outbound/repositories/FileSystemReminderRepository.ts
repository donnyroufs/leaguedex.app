import path from 'path'
import fs from 'fs/promises'
import { Result } from '../../../shared-kernel'
import { IReminderRepository, Reminder } from '../../../hexagon'

export class FileSystemReminderRepository implements IReminderRepository {
  private readonly _path: string

  private constructor(_basePath: string) {
    this._path = _basePath
  }

  public async save(reminder: Reminder): Promise<Result<void, Error>> {
    try {
      const remindersResult = await this.all()
      const reminders = remindersResult.unwrap()

      reminders.push(reminder)
      await fs.writeFile(this._path, JSON.stringify(reminders, null, 2))
      return Result.ok(undefined)
    } catch (err) {
      return Result.err(err as Error)
    }
  }

  public async all(): Promise<Result<Reminder[], Error>> {
    try {
      const file = await fs.readFile(this._path, 'utf-8')
      return Result.ok(JSON.parse(file))
    } catch (err) {
      return Result.err(err as Error)
    }
  }

  public static async create(basePath: string): Promise<FileSystemReminderRepository> {
    const filePath = path.join(basePath, 'reminders.json')

    await fs.mkdir(path.dirname(filePath), { recursive: true })

    try {
      await fs.access(filePath)
    } catch {
      await fs.writeFile(filePath, '[]')
    }

    return new FileSystemReminderRepository(filePath)
  }

  public async remove(id: string): Promise<Result<void, Error>> {
    const remindersResult = await this.all()
    const reminders = remindersResult.unwrap()

    const reminder = reminders.find((x) => x.id === id)

    if (!reminder) {
      return Result.err(new Error('Reminder not found'))
    }

    const filteredReminders = reminders.filter((x) => x.id !== id)
    await fs.writeFile(this._path, JSON.stringify(filteredReminders, null, 2))
    return Result.ok(undefined)
  }
}
