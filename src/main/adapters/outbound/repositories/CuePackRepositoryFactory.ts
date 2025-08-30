import { ICuePackRepository } from '../../../hexagon'
import { FakeCuePackRepository } from './FakeCuePackRepository'
import { FileSystemCuePackRepository } from './FileSystemCuePackRepository'

export class CuePackRepositoryFactory {
  public static async create(isProd: boolean, dataPath: string): Promise<ICuePackRepository> {
    if (isProd) {
      return FileSystemCuePackRepository.create(dataPath)
    }

    return new FakeCuePackRepository()
  }
}
