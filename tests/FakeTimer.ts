import { ITimer } from '../src/main/app/shared-kernel/ITimer'

export class FakeTimer implements ITimer {
  private _tick: number = 0
  private _callback: (() => Promise<void>) | null = null
  private _isRunning: boolean = false

  public get tick(): number {
    return this._tick
  }

  public get isRunning(): boolean {
    return this._isRunning
  }

  public start(callback: () => Promise<void>): void {
    this._callback = callback
    this._isRunning = true
  }

  public stop(): void {
    this._callback = null
    this._tick = 0
    this._isRunning = false
  }

  public async nextTick(): Promise<void> {
    if (this._callback && this._isRunning) {
      this._tick++
      await this._callback()
    }
  }
}
