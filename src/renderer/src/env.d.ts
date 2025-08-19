/// <reference types="vite/client" />

import { Contracts } from '../../main/app/shared-kernel'
import { CreateReminderDto } from '../../main/app/coaching'
import { IReminderDto } from '../../main/app/coaching/ReminderDto'

declare global {
  interface Window {
    api: {
      minimizeWindow: () => void
      maximizeWindow: () => void
      closeWindow: () => void
      app: {
        onGameData: (callback: (data: Contracts.GameDataDto) => void) => () => void
        addReminder: (data: CreateReminderDto) => Promise<string>
        getReminders: () => Promise<IReminderDto[]>
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
