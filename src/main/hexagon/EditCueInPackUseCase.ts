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

const editCueSchema = editCueInputSchema.extend({
  id: z.string().uuid()
})

export type EditCueDto = z.infer<typeof editCueInputSchema>
type EditCueInput = z.infer<typeof editCueSchema>

export class EditCueInPackUseCase implements IUseCase<EditCueInput, void> {
  public constructor(
    private readonly _audioGenerator: ITextToSpeechGenerator,
    private readonly _cuePackRepository: ICuePackRepository
  ) {}

  public async execute(data: EditCueInput): Promise<void> {
    const parsedData = editCueSchema.parse(data)

    const cuePack = await this._cuePackRepository.load(data.packId)
    const cuePackResult = cuePack.unwrap()

    if (!cuePackResult) {
      throw new Error('Cue pack not found')
    }

    // Find the existing cue
    const existingCue = cuePackResult.cues.find((c) => c.id === parsedData.id)
    if (!existingCue) {
      throw new Error('Cue not found')
    }

    // Regenerate audio if text has changed
    let audioUrl = existingCue.audioUrl
    if (existingCue.text !== parsedData.text) {
      const result = await this._audioGenerator.generate(parsedData.text)
      audioUrl = result.unwrap()
    }

    const updatedCue: Cue = {
      id: parsedData.id,
      text: parsedData.text,
      audioUrl: audioUrl,
      triggerType: parsedData.triggerType,
      interval: parsedData.interval,
      triggerAt: parsedData.triggerAt,
      event: parsedData.event,
      objective: parsedData.objective,
      beforeObjective: parsedData.beforeObjective,
      value: parsedData.value,
      endTime: parsedData.endTime
    }

    // Remove old cue and add updated one
    cuePackResult.remove(parsedData.id)
    cuePackResult.add(updatedCue)

    const saveResult = await this._cuePackRepository.save(cuePackResult)

    if (!saveResult.isOk()) {
      throw new Error('Failed to save cue pack')
    }
  }
}
