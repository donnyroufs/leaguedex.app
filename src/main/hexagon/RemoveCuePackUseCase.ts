import { IUseCase } from '../shared-kernel/IUseCase'
import { ICuePackRepository } from './ports/ICuePackRepository'

type RemoveCuePackUseCaseInput = {
  id: string
}

type RemoveCuePackUseCaseOutput = void

export class RemoveCuePackUseCase
  implements IUseCase<RemoveCuePackUseCaseInput, RemoveCuePackUseCaseOutput>
{
  public constructor(private readonly _cuePackRepository: ICuePackRepository) {}

  public async execute(input: RemoveCuePackUseCaseInput): Promise<RemoveCuePackUseCaseOutput> {
    const { id } = input

    const result = await this._cuePackRepository.remove(id)
    return result.unwrap()
  }
}
