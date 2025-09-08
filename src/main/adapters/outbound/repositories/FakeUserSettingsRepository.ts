import { IUserSettingsRepository } from '@hexagon/index'
import { UserSettings } from '@hexagon/UserSettings'
import { Result } from '../../../shared-kernel'

export class FakeUserSettingsRepository implements IUserSettingsRepository {
  private _settings: UserSettings = {
    volume: 1
  }

  public async load(): Promise<Result<UserSettings, Error>> {
    return Result.ok(this._settings)
  }

  public async save(settings: UserSettings): Promise<Result<void, Error>> {
    this._settings = settings
    return Result.ok(undefined)
  }
}
