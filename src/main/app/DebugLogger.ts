interface LogEntry {
  id: string
  timestamp: number
  level: 'log' | 'warn' | 'error' | 'info'
  message: string
  data?: unknown[]
}

export class DebugLogger {
  private static logs: LogEntry[] = []
  private static maxLogs = 1000
  private static logId = 0

  static log(message: string, ...data: unknown[]): void {
    this.addLog('log', message, data)
    console.log(`[DEBUG] ${message}`, ...data)
  }

  static warn(message: string, ...data: unknown[]): void {
    this.addLog('warn', message, data)
    console.warn(`[DEBUG] ${message}`, ...data)
  }

  static error(message: string, ...data: unknown[]): void {
    this.addLog('error', message, data)
    console.error(`[DEBUG] ${message}`, ...data)
  }

  static info(message: string, ...data: unknown[]): void {
    this.addLog('info', message, data)
    console.info(`[DEBUG] ${message}`, ...data)
  }

  private static addLog(level: LogEntry['level'], message: string, data?: unknown[]): void {
    const entry: LogEntry = {
      id: `log_${++this.logId}_${Date.now()}`,
      timestamp: Date.now(),
      level,
      message,
      data
    }

    this.logs.push(entry)

    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }
  }

  static getLogs(): LogEntry[] {
    return [...this.logs]
  }

  static getRecentLogs(count: number = 50): LogEntry[] {
    return this.logs.slice(-count)
  }

  static clearLogs(): void {
    this.logs = []
  }

  static getLogCount(): number {
    return this.logs.length
  }
}
