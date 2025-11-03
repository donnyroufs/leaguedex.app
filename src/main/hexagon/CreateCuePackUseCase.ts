import { IUseCase } from '../shared-kernel/IUseCase'
import { CuePack } from './CuePack'
import { ICuePackRepository } from './ports/ICuePackRepository'

import { z } from 'zod'

const CreateCuePackUseCaseInput = z.object({
  name: z.string()
})

export type CreateCuePackDto = z.infer<typeof CreateCuePackUseCaseInput>
type CreateCuePackUseCaseOutput = string

export class CreateCuePackUseCase
  implements IUseCase<CreateCuePackDto, CreateCuePackUseCaseOutput>
{
  public constructor(private readonly _cuePackRepository: ICuePackRepository) {}

  public async execute(input: CreateCuePackDto): Promise<CreateCuePackUseCaseOutput> {
    const validatedInput = CreateCuePackUseCaseInput.parse(input)
    const cuePack = CuePack.create(validatedInput.name)

    const result = await this._cuePackRepository.save(cuePack)

    return result.throwOrReturn(cuePack.id)
  }
}
