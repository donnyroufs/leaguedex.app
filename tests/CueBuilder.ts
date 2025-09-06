import { AudioFileName } from '@hexagon/AudioFileName'
import { Cue, CueTriggerType } from '@hexagon/Cue'

export class CueBuilder {
  private _text: string = 'from-builder'
  private _triggerType: CueTriggerType = 'interval'
  private _interval?: number = 1000
  private _event: string = 'canon-wave-spawned'

  public withText(text: string): CueBuilder {
    this._text = text
    return this
  }

  public asCanonWaveSpawned(): CueBuilder {
    this._triggerType = 'event'
    this._event = 'canon-wave-spawned'
    this._interval = undefined
    return this
  }

  public build(): Cue {
    return {
      id: crypto.randomUUID(),
      interval: this._interval,
      text: this._text,
      triggerType: this._triggerType,
      event: this._event,
      audioUrl: AudioFileName.createMP3(this._text, 'https://example.com')
    }
  }
}
