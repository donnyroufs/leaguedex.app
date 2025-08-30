/// <reference types="vite/client" />

import { CreateCueDto, ICueDto, GameDataDto, ICuePackDto, CreateCuePackDto } from '@contracts'

declare global {
  interface Window {
    api: {
      minimizeWindow: () => void
      maximizeWindow: () => void
      closeWindow: () => void
      app: {
        onGameData: (callback: (data: GameDataDto) => void) => () => void
        addCue: (data: CreateCueDto) => Promise<string>
        getCues: () => Promise<ICueDto[]>
        removeCue: (id: string) => Promise<void>
        updateLicense: (key: string) => Promise<void>
        getLicense: () => Promise<string>
        createCuePack: (data: CreateCuePackDto) => Promise<string>
        activateCuePack: (id: string) => Promise<void>
        getCuePacks: () => Promise<ICuePackDto[]>
        getActiveCuePack: () => Promise<ICuePackDto | null>
        removeCuePack: (id: string) => Promise<void>
        importPack: (code: string) => Promise<void>
      }

      getVersion: () => Promise<string>
      updater: {
        onUpdateStatus: (
          callback: (data: {
            status:
              | 'checking'
              | 'available'
              | 'not-available'
              | 'downloading'
              | 'downloaded'
              | 'error'
            version?: string
            releaseDate?: string
            progress?: number
            error?: string
          }) => void
        ) => () => void
        checkForUpdates: () => Promise<void>
        downloadUpdate: () => Promise<void>
        installUpdate: () => Promise<void>
      }
    }
  }
}

export {}
