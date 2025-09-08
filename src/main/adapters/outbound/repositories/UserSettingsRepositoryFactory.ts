import { IUserSettingsRepository } from '@hexagon/index'
import { FakeUserSettingsRepository } from './FakeUserSettingsRepository'
import { FileSystemUserSettingsRepository } from './FileSystemUserSettingsRepository'

export class UserSettingsRepositoryFactory {
  public static async create(isProd: boolean, dataPath: string): Promise<IUserSettingsRepository> {
    if (isProd) {
      return FileSystemUserSettingsRepository.create(dataPath)
    }

    return new FakeUserSettingsRepository()
  }
}
