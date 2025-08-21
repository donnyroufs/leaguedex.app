import { ReminderObjective, ReminderTriggerType } from './Reminder'

export interface IReminderDto {
  id: string
  text: string
  triggerType: ReminderTriggerType
  interval?: number
  triggerAt?: number
  event?: string
  objective?: ReminderObjective
  beforeObjective?: number
}
