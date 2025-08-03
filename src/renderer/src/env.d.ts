/// <reference types="vite/client" />

declare global {
  interface Window {
    api: {
      minimizeWindow: () => void
      maximizeWindow: () => void
      closeWindow: () => void
      gameAssistant: {
        onGameData: (
          callback: (data: { playing: boolean; gameTime: number | null }) => void
        ) => () => void
        testTTS: (text: string) => void
      }
      debug: {
        getLogs: () => Promise<
          Array<{
            id: string
            timestamp: number
            level: 'log' | 'warn' | 'error' | 'info'
            message: string
            data?: unknown[]
          }>
        >
        getRecentLogs: (count?: number) => Promise<
          Array<{
            id: string
            timestamp: number
            level: 'log' | 'warn' | 'error' | 'info'
            message: string
            data?: unknown[]
          }>
        >
        clearLogs: () => Promise<boolean>
        getLogCount: () => Promise<number>
      }
    }
  }
}

export {}
