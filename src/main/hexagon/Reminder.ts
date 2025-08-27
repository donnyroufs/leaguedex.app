import { AudioFileName } from './AudioFileName'

/**
 * The trigger type of a reminder.
 * - `interval`: Reminder that triggers every `interval` seconds.
 * - `oneTime`: Reminder that triggers at a specific time.
 * - `event`: Reminder that triggers when a specific event occurs.
 */
export type ReminderTriggerType = 'interval' | 'oneTime' | 'event' | 'objective'
export type ReminderObjective = 'dragon' | 'baron' | 'grubs' | 'herald' | 'atakhan'

export type Reminder = {
  id: string
  text: string
  audioUrl: AudioFileName
  triggerType: ReminderTriggerType
  interval?: number
  triggerAt?: number
  event?: string
  objective?: ReminderObjective
  beforeObjective?: number
}
