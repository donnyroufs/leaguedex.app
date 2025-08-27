import { IReminderRepository } from '../../../hexagon'
import { FakeReminderRepository } from './FakeReminderRepository'
import { FileSystemReminderRepository } from './FileSystemReminderRepository'

export class ReminderRepositoryFactory {
  public static async create(isProd: boolean, dataPath: string): Promise<IReminderRepository> {
    if (isProd) {
      return FileSystemReminderRepository.create(dataPath)
    }

    return new FakeReminderRepository()
  }
}
