import { ICueRepository } from '@hexagon/index'
import { FakeCueRepository } from './FakeCueRepository'
import { FileSystemCueRepository } from './FileSystemCueRepository'

export class CueRepositoryFactory {
  public static async create(isProd: boolean, dataPath: string): Promise<ICueRepository> {
    if (isProd) {
      return FileSystemCueRepository.create(dataPath)
    }

    return new FakeCueRepository()
  }
}
