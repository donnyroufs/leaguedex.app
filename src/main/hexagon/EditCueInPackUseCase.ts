import { IUseCase } from '../shared-kernel/IUseCase'
import { Cue, ICuePackRepository, ITextToSpeechGenerator } from '.'

export type EditCueDto = {
  text: string
  triggerType: 'interval' | 'oneTime' | 'event' | 'objective'
  interval?: number
  triggerAt?: number
  event?: string
  objective?: 'dragon' | 'baron' | 'grubs' | 'herald' | 'atakhan'
  beforeObjective?: number
  packId: string
  value?: number
  endTime?: number
}

type EditCueInput = {
  id: string
  text: string
  triggerType: 'interval' | 'oneTime' | 'event' | 'objective'
  interval?: number
  triggerAt?: number
  event?: string
  objective?: 'dragon' | 'baron' | 'grubs' | 'herald' | 'atakhan'
  beforeObjective?: number
  packId: string
  value?: number
  endTime?: number
}

export class EditCueInPackUseCase implements IUseCase<EditCueInput, void> {
  public constructor(
    private readonly _audioGenerator: ITextToSpeechGenerator,
    private readonly _cuePackRepository: ICuePackRepository
  ) {}

  public async execute(data: EditCueInput): Promise<void> {
    const cuePack = await this._cuePackRepository.load(data.packId)
    const cuePackResult = cuePack.unwrap()

    if (!cuePackResult) {
      throw new Error('Cue pack not found')
    }

    const existingCue = cuePackResult.cues.find((c) => c.id === data.id)
    if (!existingCue) {
      throw new Error('Cue not found')
    }

    let audioUrl = existingCue.audioUrl
    if (existingCue.text !== data.text) {
      const result = await this._audioGenerator.generate(data.text)
      audioUrl = result.unwrap()
    }

    const updatedCue: Cue = {
      id: data.id,
      text: data.text,
      audioUrl: audioUrl,
      triggerType: data.triggerType,
      interval: data.interval,
      triggerAt: data.triggerAt,
      event: data.event,
      objective: data.objective,
      beforeObjective: data.beforeObjective,
      value: data.value,
      endTime: data.endTime
    }

    cuePackResult.remove(data.id)
    cuePackResult.add(updatedCue)

    const saveResult = await this._cuePackRepository.save(cuePackResult)

    if (!saveResult.isOk()) {
      throw new Error('Failed to save cue pack')
    }
  }
}
