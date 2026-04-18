import z from 'zod'
import { IUseCase } from '../shared-kernel/IUseCase'

import { Cue, ICuePackRepository, ITextToSpeechGenerator } from '.'
import { predicateSchema } from './triggers/Predicate'

const firingModeSchema = z.discriminatedUnion('mode', [
  z.object({ mode: z.literal('edge') }),
  z.object({ mode: z.literal('edgeWithCooldown'), cooldownSeconds: z.number().int().positive() }),
  z.object({ mode: z.literal('oncePerGame') })
])

export const triggerSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('interval'), seconds: z.number().int().positive() }),
  z.object({ kind: z.literal('oneTime'), at: z.number().int().nonnegative() }),
  z.object({
    kind: z.literal('objective'),
    objective: z.enum(['dragon', 'baron', 'grubs', 'herald', 'atakhan']),
    secondsBefore: z.number().int().nonnegative()
  }),
  z.object({
    kind: z.literal('predicate'),
    predicate: predicateSchema,
    firing: firingModeSchema
  }),
  z.object({
    kind: z.literal('builtIn'),
    id: z.enum(['canon-wave-spawned', 'support-item-upgraded'])
  })
])

const createCueSchema = z.object({
  text: z.string().min(1),
  trigger: triggerSchema,
  packId: z.string().min(1),
  endTime: z.number().int().positive().optional()
})

export type CreateCueDto = z.infer<typeof createCueSchema>

export class AddCueToPackUseCase implements IUseCase<CreateCueDto, string> {
  public constructor(
    private readonly _audioGenerator: ITextToSpeechGenerator,
    private readonly _cuePackRepository: ICuePackRepository
  ) {}

  public async execute(data: CreateCueDto): Promise<string> {
    const parsedData = createCueSchema.parse(data)
    const id = crypto.randomUUID()
    const result = await this._audioGenerator.generate(parsedData.text)
    const audioPath = result.unwrap()

    const cuePack = await this._cuePackRepository.load(data.packId)
    const cuePackResult = cuePack.unwrap()

    if (!cuePackResult) {
      throw new Error('Cue pack not found')
    }

    const cue: Cue = {
      id,
      text: parsedData.text,
      audioUrl: audioPath,
      trigger: parsedData.trigger,
      endTime: parsedData.endTime
    }

    cuePackResult.add(cue)

    const saveResult = await this._cuePackRepository.save(cuePackResult)

    return saveResult.throwOrReturn(id)
  }
}
