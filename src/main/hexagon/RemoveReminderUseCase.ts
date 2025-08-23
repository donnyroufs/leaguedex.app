import { IUseCase } from '../shared-kernel/IUseCase'
import { IReminderRepository } from './ports/IReminderRepository'

class FailedToRemoveReminderError extends Error {
  public constructor(id: string) {
    super(`Failed to remove reminder with id ${id}`)
    this.name = 'FailedToRemoveReminderError'
  }
}

export class RemoveReminderUseCase implements IUseCase<string, void> {
  public constructor(private readonly _reminderRepository: IReminderRepository) {}

  public async execute(reminderId: string): Promise<void> {
    const result = await this._reminderRepository.remove(reminderId)

    if (!result.isErr()) {
      return
    }

    throw new FailedToRemoveReminderError(reminderId)
  }
}
