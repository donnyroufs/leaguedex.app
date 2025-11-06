import { ITimer } from '../../hexagon'

export class Timer implements ITimer {
  private _timeoutId: NodeJS.Timeout | null = null
  private _isRunning: boolean = false
  private _startTime: number = 0
  private _tickCount: number = 0

  public constructor(private readonly _interval: number = 1000) {}

  public start(callback: () => Promise<void>): void {
    if (this._isRunning) {
      return
    }

    this._isRunning = true
    this._startTime = Date.now()
    this._tickCount = 0

    const tick = async (): Promise<void> => {
      if (!this._isRunning) {
        return
      }

      await callback()

      if (!this._isRunning) {
        return
      }

      this._tickCount++
      const expectedNextTime = this._startTime + this._tickCount * this._interval
      const now = Date.now()
      const drift = now - expectedNextTime
      const nextDelay = Math.max(0, this._interval - drift)

      this._timeoutId = setTimeout(() => {
        tick()
      }, nextDelay)
    }

    this._timeoutId = setTimeout(() => {
      tick()
    }, this._interval)
  }

  public stop(): void {
    this._isRunning = false
    if (this._timeoutId) {
      clearTimeout(this._timeoutId)
      this._timeoutId = null
    }
    this._tickCount = 0
  }
}
