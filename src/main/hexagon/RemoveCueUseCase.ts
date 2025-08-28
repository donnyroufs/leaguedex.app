import { IUseCase } from '../shared-kernel/IUseCase'
import { ICueRepository } from './ports/ICueRepository'

class FailedToRemoveCueError extends Error {
  public constructor(id: string) {
    super(`Failed to remove cue with id ${id}`)
    this.name = 'FailedToRemoveCueError'
  }
}

export class RemoveCueUseCase implements IUseCase<string, void> {
  public constructor(private readonly _cueRepository: ICueRepository) {}

  public async execute(cueId: string): Promise<void> {
    const result = await this._cueRepository.remove(cueId)

    if (!result.isErr()) {
      return
    }

    throw new FailedToRemoveCueError(cueId)
  }
}
