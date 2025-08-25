import { ITextToSpeechGenerator } from '../src/main/hexagon'
import { Result } from '../src/main/shared-kernel'

export class TextToSpeechSpy implements ITextToSpeechGenerator {
  public totalCalls: number = 0
  public lastCalledWith: string | undefined

  public async generate(text: string): Promise<Result<string, Error>> {
    this.totalCalls++
    this.lastCalledWith = text
    return Result.ok(text)
  }
}
