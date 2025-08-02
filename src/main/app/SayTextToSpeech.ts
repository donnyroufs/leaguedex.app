import { ITextToSpeech } from './ITextToSpeech'
import say from 'say'

export class SayTextToSpeech implements ITextToSpeech {
  public speak(text: string): void {
    say.speak(text, 'Samantha', 1)
  }
}
