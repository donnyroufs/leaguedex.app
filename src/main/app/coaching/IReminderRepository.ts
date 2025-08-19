import { Result } from '../shared-kernel'

export type Reminder = {
  id: string
  interval: number
  text: string
}

export interface IReminderRepository {
  save(reminder: Reminder): Promise<Result<void, Error>>
  all(): Promise<Result<Reminder[], Error>>
}
