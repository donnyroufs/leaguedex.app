import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { Contracts } from '../main/app/shared-kernel'

const api = {
  app: {
    onGameData: (callback: (data: Contracts.GameDataDto) => void) => {
      ipcRenderer.on('game-data', (_, data) => {
        callback(data)
      })

      return () => {
        ipcRenderer.removeAllListeners('game-data')
      }
    }
  },

  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  getVersion: () => ipcRenderer.invoke('get-version'),
  updater: {
    onUpdateStatus: (
      callback: (data: {
        status: 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error'
        version?: string
        releaseDate?: string
        progress?: number
        error?: string
      }) => void
    ) => {
      ipcRenderer.on('update-status', (_, data) => {
        callback(data)
      })

      return () => {
        ipcRenderer.removeAllListeners('update-status')
      }
    },
    checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
    downloadUpdate: () => ipcRenderer.invoke('download-update'),
    installUpdate: () => ipcRenderer.invoke('install-update')
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
