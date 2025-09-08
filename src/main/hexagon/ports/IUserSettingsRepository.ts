import type { Result } from '../../shared-kernel'
import type { UserSettings } from '../UserSettings'

export interface IUserSettingsRepository {
  load(): Promise<Result<UserSettings, Error>>
  save(settings: UserSettings): Promise<Result<void, Error>>
}
