import { Seconds } from './types'

export class Reminder {
  public constructor(
    public readonly id: string,
    public readonly message: string,
    public readonly triggerTime: Seconds,
    public readonly isSystemReminder: boolean
  ) {}
}

// export class RepeatingReminder extends Reminder {
//   public constructor(id: string, message: string, isSystemReminder: boolean, triggerTime: Seconds) {
//     super(id, message, isSystemReminder, triggerTime)
//   }
// }

// export class OneTimeReminder extends Reminder {
//   public constructor(id: string, message: string, isSystemReminder: boolean, triggerTime: Seconds) {
//     super(id, message, isSystemReminder, triggerTime)
//   }
// }
