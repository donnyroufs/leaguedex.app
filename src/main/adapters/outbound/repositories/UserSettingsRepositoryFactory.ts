import { IUserSettingsRepository } from '@hexagon/index'
import { FakeUserSettingsRepository } from './FakeUserSettingsRepository'
import { FileSystemUserSettingsRepository } from './FileSystemUserSettingsRepository'

export class UserSettingsRepositoryFactory {
  public static async create(isProd: boolean): Promise<IUserSettingsRepository> {
    if (isProd) {
      // TODO: impl
      return FileSystemUserSettingsRepository.create('')
    }

    return new FakeUserSettingsRepository()
  }
}
