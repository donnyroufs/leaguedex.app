import { ITimer } from '../src/main/app/shared-kernel/ITimer'

export class FakeTimer implements ITimer {
  private _callback: (() => Promise<void>) | null = null
  private _isRunning: boolean = false

  public get isRunning(): boolean {
    return this._isRunning
  }

  public start(callback: () => Promise<void>): void {
    this._callback = callback
    this._isRunning = true
  }

  public stop(): void {
    this._callback = null
    this._isRunning = false
  }

  public async nextTick(): Promise<void> {
    if (this._callback && this._isRunning) {
      await this._callback()
    }
  }

  public async tick(): Promise<void> {
    if (this._callback && this._isRunning) {
      await this._callback()
    }
  }
}
