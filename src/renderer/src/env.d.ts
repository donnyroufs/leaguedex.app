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
      }
    }
  }
}

export {}
