import { Seconds } from './types'

export abstract class Reminder {
  public constructor(
    public readonly id: string,
    public readonly message: string,
    public readonly isSystemReminder: boolean
  ) {}
}

export class RepeatingReminder extends Reminder {
  public constructor(
    id: string,
    message: string,
    isSystemReminder: boolean,
    public readonly interval: Seconds
  ) {
    super(id, message, isSystemReminder)
  }
}

export class OneTimeReminder extends Reminder {
  public constructor(
    id: string,
    message: string,
    isSystemReminder: boolean,
    public readonly triggerTime: Seconds
  ) {
    super(id, message, isSystemReminder)
  }
}
