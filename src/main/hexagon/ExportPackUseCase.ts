import { IUseCase } from '../shared-kernel/IUseCase'
import { CuePackEncoder } from './CuePackEncoder'
import { ICuePackRepository } from './ports/ICuePackRepository'

type ExportPackUseCaseInput = {
  id: string
}

type ExportPackUseCaseOutput = string

export class ExportPackUseCase
  implements IUseCase<ExportPackUseCaseInput, ExportPackUseCaseOutput>
{
  public constructor(private readonly _cuePackRepository: ICuePackRepository) {}

  public async execute(input: ExportPackUseCaseInput): Promise<ExportPackUseCaseOutput> {
    const { id } = input

    const cuePack = await this._cuePackRepository.load(id)

    if (!cuePack) {
      throw new Error('Cue pack not found')
    }

    const encoded = CuePackEncoder.encode(cuePack.unwrap()!)

    return encoded
  }
}
