import React, { useState, useEffect } from 'react'

interface LogEntry {
  id: string
  timestamp: number
  level: 'log' | 'warn' | 'error' | 'info'
  message: string
  data?: unknown[]
}

export const DebugPanel: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const [autoScroll, setAutoScroll] = useState(true)

  useEffect(() => {
    const pollLogs = async (): Promise<void> => {
      try {
        const recentLogs = await window.api.debug.getRecentLogs(100)
        setLogs(recentLogs)
      } catch (error) {
        console.error('Failed to fetch debug logs:', error)
      }
    }

    if (isVisible) {
      pollLogs()
      const interval = setInterval(pollLogs, 1000) // Poll every second
      return () => clearInterval(interval)
    }
  }, [isVisible])

  const clearLogs = async (): Promise<void> => {
    try {
      await window.api.debug.clearLogs()
      setLogs([])
    } catch (error) {
      console.error('Failed to clear logs:', error)
    }
  }

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const getLevelColor = (level: LogEntry['level']): string => {
    switch (level) {
      case 'error':
        return 'text-red-500'
      case 'warn':
        return 'text-yellow-500'
      case 'info':
        return 'text-blue-500'
      default:
        return 'text-gray-300'
    }
  }

  const logContainerRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [logs, autoScroll])

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-700 z-50"
      >
        Debug Logs
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-96 bg-gray-900 text-white rounded-lg shadow-lg z-50 flex flex-col">
      <div className="flex justify-between items-center p-3 border-b border-gray-700">
        <h3 className="font-semibold">Debug Logs</h3>
        <div className="flex gap-2">
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="mr-1"
            />
            Auto-scroll
          </label>
          <button
            onClick={clearLogs}
            className="text-xs bg-red-600 px-2 py-1 rounded hover:bg-red-700"
          >
            Clear
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-xs bg-gray-600 px-2 py-1 rounded hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>

      <div ref={logContainerRef} className="flex-1 overflow-y-auto p-3 text-xs font-mono">
        {logs.length === 0 ? (
          <div className="text-gray-500 text-center mt-4">No logs yet...</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="mb-2">
              <div className="flex items-start gap-2">
                <span className="text-gray-500 min-w-[60px]">{formatTimestamp(log.timestamp)}</span>
                <span className={`min-w-[40px] ${getLevelColor(log.level)}`}>
                  [{log.level.toUpperCase()}]
                </span>
                <span className="flex-1 break-words">{log.message}</span>
              </div>
              {log.data && log.data.length > 0 && (
                <div className="ml-[100px] text-gray-400">
                  {log.data.map((item, index) => (
                    <div key={index} className="mt-1">
                      {typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
