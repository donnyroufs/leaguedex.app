import { Result } from '../shared-kernel'

/**
 * The trigger type of a reminder.
 * - `interval`: Reminder that triggers every `interval` seconds.
 * - `oneTime`: Reminder that triggers at a specific time.
 * - `event`: Reminder that triggers when a specific event occurs.
 */
export type ReminderTriggerType = 'interval' | 'oneTime' | 'event'

export type Reminder = {
  id: string
  text: string
  audioUrl: string
  triggerType: ReminderTriggerType
  interval?: number
  triggerAt?: number
  event?: string
}

export interface IReminderRepository {
  save(reminder: Reminder): Promise<Result<void, Error>>
  all(): Promise<Result<Reminder[], Error>>
}
