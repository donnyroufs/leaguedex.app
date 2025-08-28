import { AudioFileName } from '@hexagon/AudioFileName'
import { Cue } from '@hexagon/Cue'

export class CueBuilder {
  private _text: string = 'from-builder'

  public withText(text: string): CueBuilder {
    this._text = text
    return this
  }

  public build(): Cue {
    return {
      id: crypto.randomUUID(),
      interval: 1000,
      text: this._text,
      triggerType: 'interval',
      audioUrl: AudioFileName.createMP3(this._text, 'https://example.com')
    }
  }
}
