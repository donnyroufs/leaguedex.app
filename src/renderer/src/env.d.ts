/// <reference types="vite/client" />

type Game = {
  id: string
  matchupId: string
  createdAt: string
  status: 'in-progress' | 'completed' | 'reviewed'
  notes: MatchupNote[]
}

type MatchupNote = {
  id: string
  content: string
  matchupId: string
  gameId: string
  createdAt: string
}

declare global {
  interface Window {
    api: {
      minimizeWindow: () => void
      maximizeWindow: () => void
      closeWindow: () => void
      gameAssistant: {
        onGameData: (
          callback: (data: {
            playing: boolean
            gameTime: number | null
            matchup: Matchup | null
            insights: string | null
          }) => void
        ) => () => void
        getReminders: () => Promise<Reminder[]>
        addReminder: (reminder: Reminder) => Promise<void>
        removeReminder(id: string): Promise<void>
      }
      getVersion: () => Promise<string>
      updateConfig: (config: UserConfig) => Promise<UserConfig>
      getConfig: () => Promise<UserConfig>
      getGames: () => Promise<Game[]>
    }
  }
}

export {}
