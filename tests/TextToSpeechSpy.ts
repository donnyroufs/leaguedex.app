import { ITextToSpeech } from '../src/main/hexagon/ports/ITextToSpeech'
import { Result } from '../src/main/shared-kernel'

export class TextToSpeechSpy implements ITextToSpeech {
  public totalCalls: number = 0
  public lastCalledWith: string | undefined

  public async generate(text: string): Promise<Result<string, Error>> {
    this.totalCalls++
    this.lastCalledWith = text
    return Result.ok(text)
  }
}
