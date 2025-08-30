import { IUseCase } from '../shared-kernel/IUseCase'
import { ICuePackDto } from './GetCuePacksUseCase'
import { ICuePackRepository } from './ports/ICuePackRepository'

type GetActiveCuePackUseCaseInput = void
type GetActiveCuePackUseCaseOutput = ICuePackDto | null

export class GetActiveCuePackUseCase
  implements IUseCase<GetActiveCuePackUseCaseInput, GetActiveCuePackUseCaseOutput>
{
  public constructor(private readonly _cuePackRepository: ICuePackRepository) {}

  public async execute(): Promise<GetActiveCuePackUseCaseOutput> {
    const result = await this._cuePackRepository.active()

    if (result.isErr() || result.unwrap() === null) {
      return null
    }

    const pack = result.unwrap()!

    return {
      id: pack.id,
      name: pack.name,
      cues: pack.cues.map((cue) => ({
        id: cue.id,
        text: cue.text,
        triggerType: cue.triggerType,
        interval: cue.interval,
        triggerAt: cue.triggerAt,
        event: cue.event,
        objective: cue.objective,
        beforeObjective: cue.beforeObjective
      }))
    }
  }
}
