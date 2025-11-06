import { ILogger } from '../src/main/hexagon/ports/ILogger'

export class LoggerStub implements ILogger {
  public info(): void {}
  public error(): void {}
  public debug(): void {}
}
