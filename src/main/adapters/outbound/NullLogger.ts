import { ILogger } from '../../hexagon'

export class NullLogger implements ILogger {
  public info(): void {
    return
  }

  public error(): void {
    return
  }

  public debug(): void {
    return
  }

  public warn(): void {
    return
  }
}
