type TimerCallback = () => Promise<void>

export interface ITimer {
  start(callback: TimerCallback): void
  stop(): void
}
