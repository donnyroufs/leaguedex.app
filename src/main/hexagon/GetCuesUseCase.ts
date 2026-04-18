import { IUseCase } from '../shared-kernel/IUseCase'
import { ICueDto } from './ICueDto'
import { ICuePackRepository } from './ports/ICuePackRepository'

export class GetCuesUseCase implements IUseCase<void, ICueDto[]> {
  public constructor(private readonly _cueRepository: ICuePackRepository) {}

  public async execute(): Promise<ICueDto[]> {
    const result = await this._cueRepository.active()

    if (result.isErr() || result.unwrap() === null) {
      return []
    }

    const cues = result.unwrap()!.cues

    return cues.map((cue) => ({
      id: cue.id,
      text: cue.text,
      trigger: cue.trigger,
      endTime: cue.endTime
    }))
  }
}
