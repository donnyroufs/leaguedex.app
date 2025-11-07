import z from 'zod'
import { IUseCase } from '../shared-kernel/IUseCase'
import { Cue, ICuePackRepository, ITextToSpeechGenerator } from '.'

const editCueInputSchema = z
  .object({
    text: z.string().min(1),
    triggerType: z.enum(['interval', 'oneTime', 'event', 'objective']),
    interval: z.number().min(1).optional(),
    triggerAt: z.number().min(0).optional(),
    event: z.string().optional(),
    objective: z.enum(['dragon', 'baron', 'grubs', 'herald', 'atakhan']).optional(),
    beforeObjective: z.number().min(0).optional(),
    packId: z.string().min(1),
    value: z.number().optional(),
    endTime: z.number().int().positive().optional()
  })
  .superRefine((data, ctx) => {
    if (data.event === 'mana-changed') {
      if (data.value === undefined || data.value === null) {
        ctx.addIssue({
          code: 'custom',
          message: "Value is required when event is 'mana-changed'",
          path: ['value']
        })
      }
    }
  })

export type EditCueDto = z.infer<typeof editCueInputSchema>

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
