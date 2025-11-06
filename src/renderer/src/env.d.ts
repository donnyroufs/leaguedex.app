/// <reference types="vite/client" />

import type {
  CreateCueDto,
  ICueDto,
  GameDataDto,
  ICuePackDto,
  CreateCuePackDto,
  IUserSettingsDto
} from '@contracts'

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
        createCuePack: (data: CreateCuePackDto) => Promise<string>
        activateCuePack: (id: string) => Promise<void>
        getCuePacks: () => Promise<ICuePackDto[]>
        getActiveCuePack: () => Promise<ICuePackDto | null>
        removeCuePack: (id: string) => Promise<void>
        importPack: (code: string) => Promise<void>
        exportPack: (id: string) => Promise<string>
        updateUserSettings: (data: IUserSettingsDto) => Promise<void>
        getUserSettings: () => Promise<IUserSettingsDto>
        playCue: (id: string) => Promise<void>
        regenerateAudio: () => Promise<void>
        onRegenerateProgress: (
          callback: (data: {
            completedPacks: number
            totalPacks: number
            completedCues: number
            totalUniqueCues: number
          }) => void
        ) => () => void
        onRegenerateComplete: (callback: () => void) => () => void
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
