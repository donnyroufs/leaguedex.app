import { IUserSettingsRepository } from '../src/main/hexagon/ports/IUserSettingsRepository'
import { Result } from '../src/main/shared-kernel'
import { UserSettings } from '../src/main/hexagon/UserSettings'

export class UserSettingsRepositorySpy implements IUserSettingsRepository {
  public settings: UserSettings = { volume: 0.8 }
  public loadError: Error | null = null
  public saveError: Error | null = null
  public loadCallCount = 0
  public saveCallCount = 0

  public async load(): Promise<Result<UserSettings, Error>> {
    this.loadCallCount++
    if (this.loadError) {
      return Result.err(this.loadError)
    }
    return Result.ok(this.settings)
  }

  public async save(settings: UserSettings): Promise<Result<void, Error>> {
    this.saveCallCount++
    if (this.saveError) {
      return Result.err(this.saveError)
    }
    this.settings = settings
    return Result.ok(undefined)
  }

  public clear(): void {
    this.settings = { volume: 0.8 }
    this.loadError = null
    this.saveError = null
    this.loadCallCount = 0
    this.saveCallCount = 0
  }
}
