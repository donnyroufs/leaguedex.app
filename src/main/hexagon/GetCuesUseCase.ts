import { IUseCase } from '../shared-kernel/IUseCase'
import { ICueDto } from './ICueDto'
import { ICueRepository } from './ports/ICueRepository'

export class GetCuesUseCase implements IUseCase<void, ICueDto[]> {
  public constructor(private readonly _cueRepository: ICueRepository) {}

  public async execute(): Promise<ICueDto[]> {
    const result = await this._cueRepository.all()

    const cues = result.unwrap()

    return cues.map((cue) => ({
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
