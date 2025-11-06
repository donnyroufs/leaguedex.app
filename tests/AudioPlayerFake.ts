import { IAudioPlayer } from '../src/main/hexagon/ports/IAudioPlayer'
import { Result } from '../src/main/shared-kernel'

export class AudioPlayerFake implements IAudioPlayer {
  public calls: string[] = []
  public totalCalls = 0
  private _pendingPromises: Array<() => void> = []
  private _shouldFail = false

  public async play(audioName: string): Promise<Result<void, Error>> {
    this.totalCalls++
    this.calls.push(audioName)

    if (this._shouldFail) {
      return Result.err(new Error('Audio playback failed'))
    }

    await new Promise<void>((resolve) => {
      this._pendingPromises.push(resolve)
    })

    return Result.ok(undefined)
  }

  public failNext(): void {
    this._shouldFail = true
  }

  public resolveNext(): void {
    const resolve = this._pendingPromises.shift()
    if (resolve) {
      resolve()
    }
  }

  public resolveAll(): void {
    while (this._pendingPromises.length > 0) {
      this.resolveNext()
    }
  }

  public get pendingCount(): number {
    return this._pendingPromises.length
  }

  public clear(): void {
    this.calls = []
    this.totalCalls = 0
    this._pendingPromises = []
    this._shouldFail = false
  }
}
