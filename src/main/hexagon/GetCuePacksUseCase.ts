import { IUseCase } from '../shared-kernel/IUseCase'
import { ICueDto } from './ICueDto'
import { ICuePackRepository } from './ports/ICuePackRepository'

type GetCuePacksUseCaseInput = void
type GetCuePacksUseCaseOutput = ICuePackDto[]

export interface ICuePackDto {
  id: string
  name: string
  cues: ICueDto[]
}

export class GetCuePacksUseCase
  implements IUseCase<GetCuePacksUseCaseInput, GetCuePacksUseCaseOutput>
{
  public constructor(private readonly _cuePackRepository: ICuePackRepository) {}

  public async execute(): Promise<GetCuePacksUseCaseOutput> {
    const result = await this._cuePackRepository.all()

    const cuePacks = result.unwrap()

    return cuePacks.map((cuePack) => ({
      id: cuePack.id,
      name: cuePack.name,
      cues: cuePack.cues.map((cue) => ({
        id: cue.id,
        text: cue.text,
        triggerType: cue.triggerType,
        interval: cue.interval,
        triggerAt: cue.triggerAt,
        event: cue.event,
        objective: cue.objective,
        beforeObjective: cue.beforeObjective
      }))
    }))
  }
}
