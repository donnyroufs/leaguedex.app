import { IAudioPlayer } from '../src/main/hexagon/ports/IAudioPlayer'
import { Result } from '../src/main/shared-kernel'

export class AudioSpy implements IAudioPlayer {
  public totalCalls: number = 0
  public lastCalledWith: string | undefined
  public calls: string[] = []

  public async play(audioName: string): Promise<Result<void, Error>> {
    this.totalCalls++
    this.lastCalledWith = audioName
    this.calls.push(audioName)
    return Result.ok(undefined)
  }

  public clear(): void {
    this.totalCalls = 0
    this.lastCalledWith = undefined
    this.calls = []
  }
}
