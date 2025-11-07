import { ILogger } from '../src/main/hexagon/ports/ILogger'

export class LoggerStub implements ILogger {
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
