/// <reference types="vite/client" />

declare global {
  interface Window {
    api: {
      minimizeWindow: () => void
      maximizeWindow: () => void
      closeWindow: () => void
      gameDetector: {
        detect: () => Promise<number | null>
      }
    }
  }
}

export {}
