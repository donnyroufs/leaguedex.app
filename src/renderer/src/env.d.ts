/// <reference types="vite/client" />

import type {
  CreateCueDto,
  EditCueDto,
  ICueDto,
  GameDataDto,
  ICuePackDto,
  CreateCuePackDto,
  IUserSettingsDto,
  SpeechEngineInput,
  SpeechEngineView,
  OpenAITtsModel,
  OpenAITtsVoice
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
        editCue: (id: string, data: EditCueDto) => Promise<void>
        createCuePack: (data: CreateCuePackDto) => Promise<string>
        activateCuePack: (id: string) => Promise<void>
        getCuePacks: () => Promise<ICuePackDto[]>
        getActiveCuePack: () => Promise<ICuePackDto | null>
        removeCuePack: (id: string) => Promise<void>
        renameCuePack: (id: string, name: string) => Promise<void>
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
        getSpeechEngine: () => Promise<SpeechEngineView>
        updateSpeechEngine: (input: SpeechEngineInput) => Promise<void>
        installLocalSpeechModel: () => Promise<void>
        testOpenAIKey: (
          apiKey: string,
          model: OpenAITtsModel,
          voice: OpenAITtsVoice
        ) => Promise<void>
        onModelDownloadProgress: (
          callback: (data: {
            phase: 'downloading' | 'extracting'
            receivedBytes: number
            totalBytes: number
          }) => void
        ) => () => void
        onModelDownloadComplete: (callback: () => void) => () => void
        onModelDownloadError: (callback: (data: { message: string }) => void) => () => void
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
