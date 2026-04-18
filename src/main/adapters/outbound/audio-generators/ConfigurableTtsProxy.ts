import { ITextToSpeechGenerator } from '../../../hexagon'
import { AudioFileName } from '@hexagon/AudioFileName'
import { Result } from '../../../shared-kernel'

export class ConfigurableTtsProxy implements ITextToSpeechGenerator {
  public constructor(private _inner: ITextToSpeechGenerator) {}

  public generate(text: string): Promise<Result<AudioFileName, Error>> {
    return this._inner.generate(text)
  }

  public reconfigure(next: ITextToSpeechGenerator): void {
    this._inner = next
  }
}
