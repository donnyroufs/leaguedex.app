import { Result } from '../shared-kernel'

export type Reminder = {
  id: string
  interval: number
  text: string
  audioUrl: string
  isRepeating: boolean
}

export interface IReminderRepository {
  save(reminder: Reminder): Promise<Result<void, Error>>
  all(): Promise<Result<Reminder[], Error>>
}
