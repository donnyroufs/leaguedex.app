import { app } from 'electron'
import { appendFileSync } from 'fs'
import path from 'node:path'

type LogItem = {
  timestamp: string
  message: string
  data?: Record<string, unknown>
}

// TODO: we can actually use the electron logger
// app.setLogPath() and then we can use console api
export class Logger {
  private static _batch: LogItem[] = []

  public static log(message: string, data?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString()
    this._batch.push({ timestamp, message, data })
    console.log(`[${timestamp}] ${message}`)

    if (this._batch.length >= 10) {
      this.flush()
    }
  }

  private static flush(): void {
    const dir = app.isPackaged
      ? path.join(app.getPath('userData'), 'logs.json')
      : path.join(__dirname, '../../dev-logs.json')

    appendFileSync(dir, JSON.stringify(this._batch, null, 2))
    this._batch = []
  }
}
