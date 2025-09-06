import { AudioFileName, ITextToSpeechGenerator } from '../src/main/hexagon'
import { Result } from '../src/main/shared-kernel'

export class TextToSpeechSpy implements ITextToSpeechGenerator {
  public totalCalls: number = 0
  public lastCalledWith: string | undefined

  public async generate(text: string): Promise<Result<AudioFileName, Error>> {
    this.totalCalls++
    this.lastCalledWith = text
    return Result.ok(AudioFileName.createMP3(text))
  }

  public clear(): void {
    this.totalCalls = 0
    this.lastCalledWith = undefined
  }
}
