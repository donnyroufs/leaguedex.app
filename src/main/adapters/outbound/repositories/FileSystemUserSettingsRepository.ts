import { IUserSettingsRepository } from '@hexagon/index'
import { UserSettings } from '@hexagon/UserSettings'
import { Result } from '../../../shared-kernel'

import fs from 'fs/promises'
import path from 'path'

export class FileSystemUserSettingsRepository implements IUserSettingsRepository {
  private _cache: UserSettings | null = null

  private constructor(private readonly _path: string) {}

  public async load(): Promise<Result<UserSettings, Error>> {
    if (this._cache) {
      return Result.ok(this._cache)
    }

    const settings = await fs.readFile(this._path, 'utf8')
    this._cache = JSON.parse(settings)
    return Result.ok(this._cache!)
  }

  public async save(settings: UserSettings): Promise<Result<void, Error>> {
    await fs.writeFile(this._path, JSON.stringify(settings))
    this._cache = settings
    return Result.ok(undefined)
  }

  public static async create(basePath: string): Promise<FileSystemUserSettingsRepository> {
    const filePath = path.join(basePath, 'user-settings.json')

    await fs.mkdir(path.dirname(filePath), { recursive: true })

    try {
      await fs.access(filePath)
    } catch {
      await fs.writeFile(filePath, JSON.stringify({ volume: 1 }))
    }

    return new FileSystemUserSettingsRepository(filePath)
  }
}
