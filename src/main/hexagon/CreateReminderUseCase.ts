import z from 'zod'
import { IUseCase } from '../shared-kernel/IUseCase'

import { IReminderRepository } from './ports/IReminderRepository'
import { ITextToSpeech } from './ports/ITextToSpeech'

const createReminderSchema = z.object({
  text: z.string().min(1),
  triggerType: z.enum(['interval', 'oneTime', 'event']),
  interval: z.number().min(1).optional(),
  triggerAt: z.number().min(0).optional(),
  event: z.string().optional()
})

export type CreateReminderDto = z.infer<typeof createReminderSchema>

export class CreateReminderUseCase implements IUseCase<CreateReminderDto, string> {
  public constructor(
    private readonly _tts: ITextToSpeech,
    private readonly _reminderRepository: IReminderRepository
  ) {}

  public async execute(data: CreateReminderDto): Promise<string> {
    const parsedData = createReminderSchema.parse(data)
    const id = crypto.randomUUID()
    const result = await this._tts.generate(parsedData.text)
    const audioPath = result.unwrap()

    const saveResult = await this._reminderRepository.save({
      id,
      text: parsedData.text,
      audioUrl: audioPath,
      triggerType: parsedData.triggerType,
      interval: parsedData.interval,
      triggerAt: parsedData.triggerAt,
      event: parsedData.event
    })

    return saveResult.throwOrReturn(id)
  }
}
