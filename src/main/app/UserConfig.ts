import fs from 'fs/promises'
import { access, constants, readFileSync, writeFileSync } from 'fs'
import { app } from 'electron'
import { join } from 'path'

export type UserConfig = {
  gameAssistance: {
    enableNeutralObjectiveTimers: boolean
  }
}

function createDefaultConfig(): UserConfig {
  return {
    gameAssistance: {
      enableNeutralObjectiveTimers: true
    }
  }
}

export class UserConfigRepository {
  private _loadedConfig: UserConfig | null = null

  public constructor(private readonly _path: string) {}

  public configure(): void {
    access(this._path, constants.F_OK, (err) => {
      if (!err) {
        console.info(`User config file already exists at ${this._path}.`)
        this._loadedConfig = JSON.parse(readFileSync(this._path, 'utf8'))
        return
      }

      console.error(err)
      console.info(`User config file does not exist at ${this._path}. Creating it...`)
      const defaultConfig = createDefaultConfig()
      writeFileSync(this._path, JSON.stringify(defaultConfig))
      this._loadedConfig = defaultConfig
      console.info(`User config file created at ${this._path}.`)
    })
  }

  public getConfig(): UserConfig {
    if (!this._loadedConfig) {
      throw new Error('Config not loaded')
    }

    return this._loadedConfig
  }

  public async update(config: UserConfig): Promise<void> {
    await fs.writeFile(this._path, JSON.stringify(config, null, 2))
    this._loadedConfig = config
  }

  public static create(): UserConfigRepository {
    const path = app.isPackaged
      ? join(app.getPath('userData'), 'config.json')
      : join(__dirname, '../../dev-config.json')

    const repo = new UserConfigRepository(path)
    repo.configure()
    return repo
  }
}
