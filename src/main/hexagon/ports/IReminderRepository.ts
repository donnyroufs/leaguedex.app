import { Result } from '../../shared-kernel'
import { Reminder } from '../Reminder'

export interface IReminderRepository {
  save(reminder: Reminder): Promise<Result<void, Error>>
  all(): Promise<Result<Reminder[], Error>>
}
