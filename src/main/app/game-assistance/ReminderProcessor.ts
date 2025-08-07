import { ITextToSpeech } from './ITextToSpeech'
import { Reminder } from './Reminder'

export class ReminderProcessor {
  private _queue: Reminder[] = []
  private _processing = false

  public constructor(private readonly _textToSpeech: ITextToSpeech) {}

  public process(reminders: Reminder[]): void {
    this._queue.push(...reminders)

    if (!this._processing) {
      this.processQueue()
    }
  }

  private async processQueue(): Promise<void> {
    if (this._queue.length === 0) {
      this._processing = false
      return
    }

    this._processing = true
    const reminder = this._queue.shift()!

    this._textToSpeech.speak(reminder.message)

    const duration = Math.ceil(reminder.message.length * 300)
    await new Promise((resolve) => setTimeout(resolve, duration))

    this.processQueue()
  }
}

