import { z } from 'zod'
import { IUseCase } from '../shared-kernel/IUseCase'
import { ICuePackRepository } from './ports/ICuePackRepository'

const renameCuePackInputSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Pack name cannot be empty')
})

type RenameCuePackUseCaseInput = z.infer<typeof renameCuePackInputSchema>

export class RenameCuePackUseCase implements IUseCase<RenameCuePackUseCaseInput, void> {
  public constructor(private readonly _cuePackRepository: ICuePackRepository) {}

  public async execute(input: RenameCuePackUseCaseInput): Promise<void> {
    const validatedInput = renameCuePackInputSchema.parse(input)
    const { id, name } = validatedInput

    const packResult = await this._cuePackRepository.load(id)

    if (!packResult.isOk() || packResult.unwrap() === null) {
      throw new Error('Cue pack not found')
    }

    const pack = packResult.unwrap()!
    pack.rename(name)

    const saveResult = await this._cuePackRepository.save(pack)

    if (!saveResult.isOk()) {
      throw new Error('Failed to rename cue pack')
    }
  }
}
