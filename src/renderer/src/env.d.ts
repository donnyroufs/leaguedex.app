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
        getReminders: () => Promise<Reminder[]>
        addReminder: (reminder: Reminder) => Promise<void>
        removeReminder(id: string): Promise<void>
      }
      getVersion: () => Promise<string>
      updateConfig: (config: UserConfig) => Promise<UserConfig>
      getConfig: () => Promise<UserConfig>
    }
  }
}

export {}
