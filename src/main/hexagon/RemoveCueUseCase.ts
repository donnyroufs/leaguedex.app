import { IUseCase } from '../shared-kernel/IUseCase'
import { ICuePackRepository } from './ports/ICuePackRepository'

class FailedToRemoveCueError extends Error {
  public constructor(id: string) {
    super(`Failed to remove cue with id ${id}`)
    this.name = 'FailedToRemoveCueError'
  }
}

// TODO: add test
export class RemoveCueUseCase implements IUseCase<string, void> {
  public constructor(private readonly _cueRepository: ICuePackRepository) {}

  public async execute(cueId: string): Promise<void> {
    const result = await this._cueRepository.removeCue(cueId)

    if (!result.isErr()) {
      return
    }

    throw new FailedToRemoveCueError(cueId)
  }
}
