import { ITimer } from '../../hexagon'

export class Timer implements ITimer {
  private _intervalId: NodeJS.Timeout | null = null

  public constructor(private readonly _interval: number = 1000) {}

  public start(callback: () => Promise<void>): void {
    this._intervalId = setInterval(callback, this._interval)
  }

  public stop(): void {
    if (this._intervalId) {
      clearInterval(this._intervalId)
      this._intervalId = null
    }
  }
}
