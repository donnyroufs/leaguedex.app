import { IReminderDto } from './ReminderDto'
import { IUseCase } from '../shared-kernel/IUseCase'
import { IReminderRepository } from './ports/IReminderRepository'

export class GetRemindersUseCase implements IUseCase<void, IReminderDto[]> {
  public constructor(private readonly _reminderRepository: IReminderRepository) {}

  public async execute(): Promise<IReminderDto[]> {
    const result = await this._reminderRepository.all()

    const reminders = result.unwrap()

    return reminders.map((reminder) => ({
      id: reminder.id,
      text: reminder.text,
      triggerType: reminder.triggerType,
      interval: reminder.interval,
      triggerAt: reminder.triggerAt,
      event: reminder.event,
      objective: reminder.objective,
      beforeObjective: reminder.beforeObjective
    }))
  }
}
