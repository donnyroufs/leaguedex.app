import { IUserSettingsRepository } from '../src/main/hexagon/ports/IUserSettingsRepository'
import { Result } from '../src/main/shared-kernel'
import { UserSettings } from '../src/main/hexagon/UserSettings'

export class UserSettingsRepositoryDummy implements IUserSettingsRepository {
  public async load(): Promise<Result<UserSettings, Error>> {
    return Result.ok({ volume: 1 })
  }

  public async save(): Promise<Result<void, Error>> {
    return Result.ok()
  }
}
