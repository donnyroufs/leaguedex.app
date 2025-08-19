import { ILogger } from './ILogger'
import log from 'electron-log'

export class ElectronLogger implements ILogger {
  public constructor(path: string, level: 'info' | 'error' = 'info') {
    log.transports.file.level = level
    log.transports.file.resolvePathFn = () => path
    log.transports.file.maxSize = 1024 * 1024 * 10 // 10MB
  }

  public info(message: string, data: Record<string, unknown> = {}): void {
    log.info(message, data)
  }

  public error(message: string, data: Record<string, unknown> = {}): void {
    log.error(message, data)
  }
}
