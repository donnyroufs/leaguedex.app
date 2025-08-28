import z from 'zod'
import { IUseCase } from '../shared-kernel/IUseCase'

import { ICueRepository, ITextToSpeechGenerator } from '.'

const createCueSchema = z.object({
  text: z.string().min(1),
  triggerType: z.enum(['interval', 'oneTime', 'event', 'objective']),
  interval: z.number().min(1).optional(),
  triggerAt: z.number().min(0).optional(),
  event: z.string().optional(),
  objective: z.enum(['dragon', 'baron', 'grubs', 'herald', 'atakhan']).optional(),
  beforeObjective: z.number().min(0).optional()
})

export type CreateCueDto = z.infer<typeof createCueSchema>

export class CreateCueUseCase implements IUseCase<CreateCueDto, string> {
  public constructor(
    private readonly _audioGenerator: ITextToSpeechGenerator,
    private readonly _cueRepository: ICueRepository
  ) {}

  public async execute(data: CreateCueDto): Promise<string> {
    const parsedData = createCueSchema.parse(data)
    const id = crypto.randomUUID()
    const result = await this._audioGenerator.generate(parsedData.text)
    const audioPath = result.unwrap()

    const saveResult = await this._cueRepository.save({
      id,
      text: parsedData.text,
      audioUrl: audioPath,
      triggerType: parsedData.triggerType,
      interval: parsedData.interval,
      triggerAt: parsedData.triggerAt,
      event: parsedData.event,
      objective: parsedData.objective,
      beforeObjective: parsedData.beforeObjective
    })

    return saveResult.throwOrReturn(id)
  }
}
