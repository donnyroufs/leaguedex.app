import { AudioFileName } from '@hexagon/AudioFileName'
import { Reminder } from '../src/main/hexagon/Reminder'

export class ReminderBuilder {
  private _text: string = 'from-builder'

  public withText(text: string): ReminderBuilder {
    this._text = text
    return this
  }

  public build(): Reminder {
    return {
      id: crypto.randomUUID(),
      interval: 1000,
      text: this._text,
      triggerType: 'interval',
      audioUrl: AudioFileName.createMP3('audio', 'https://example.com')
    }
  }
}
