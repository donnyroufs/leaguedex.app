import { Seconds } from './types'

export abstract class Reminder {
  public constructor(
    public readonly id: string,
    public readonly message: string
  ) {}
}

export class RepeatingReminder extends Reminder {
  public constructor(
    id: string,
    message: string,
    public readonly interval: Seconds
  ) {
    super(id, message)
  }

  public static is(reminder: Reminder): reminder is RepeatingReminder {
    return (
      ('interval' in reminder || reminder instanceof RepeatingReminder) && reminder.interval != null
    )
  }
}

export class OneTimeReminder extends Reminder {
  public constructor(
    id: string,
    message: string,
    public readonly triggerTime: Seconds
  ) {
    super(id, message)
  }

  public static is(reminder: Reminder): reminder is OneTimeReminder {
    return (
      ('triggerTime' in reminder || reminder instanceof OneTimeReminder) &&
      reminder.triggerTime != null
    )
  }
}
