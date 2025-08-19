import z from 'zod'

import { Result } from '../shared-kernel'
import { IReminderDto } from './ReminderDto'
import { IReminderRepository } from './IReminderRepository'

const createReminderSchema = z.object({
  interval: z.number().min(1),
  text: z.string().min(1)
})

export type CreateReminderDto = z.infer<typeof createReminderSchema>

export class CoachingModule {
  public constructor(private readonly _reminderRepository: IReminderRepository) {}

  public async addReminder(data: CreateReminderDto): Promise<string> {
    const parsedData = createReminderSchema.parse(data)
    const id = crypto.randomUUID()

    const result = await this._reminderRepository.save({
      id,
      interval: parsedData.interval,
      text: parsedData.text
    })

    return result.throwOrReturn(id)
  }

  public async getReminders(): Promise<IReminderDto[]> {
    const result = await this._reminderRepository.all()

    const reminders = result.unwrap()

    return reminders.map((reminder) => ({
      id: reminder.id,
      interval: reminder.interval,
      text: reminder.text
    }))
  }

  public async init(): Promise<Result<string, Error>> {
    return Result.ok('Coaching initialized')
  }

  public async dispose(): Promise<Result<string, Error>> {
    return Result.ok('Coaching disposed')
  }
}

export type { IReminderRepository } from './IReminderRepository'
export { FileSystemReminderRepository } from './FileSystemReminderRepository'
