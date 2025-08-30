import { IUseCase } from '../shared-kernel/IUseCase'
import { CuePackRemovedEvent } from './domain-events'
import { ICuePackRepository } from './ports/ICuePackRepository'
import { IEventBus } from './ports/IEventBus'

type RemoveCuePackUseCaseInput = {
  id: string
}

type RemoveCuePackUseCaseOutput = void

export class RemoveCuePackUseCase
  implements IUseCase<RemoveCuePackUseCaseInput, RemoveCuePackUseCaseOutput>
{
  public constructor(
    private readonly _cuePackRepository: ICuePackRepository,
    private readonly _eventBus: IEventBus
  ) {}

  public async execute(input: RemoveCuePackUseCaseInput): Promise<RemoveCuePackUseCaseOutput> {
    const { id } = input

    const result = await this._cuePackRepository.remove(id)
    this._eventBus.publish('cue-pack-removed', new CuePackRemovedEvent(id))
    return result.unwrap()
  }
}
