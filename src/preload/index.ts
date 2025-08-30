import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { CreateCueDto, CreateCuePackDto, GameDataDto } from '@contracts'

const api = {
  app: {
    onGameData: (callback: (data: GameDataDto) => void) => {
      ipcRenderer.on('game-data', (_, data) => {
        callback(data)
      })

      return () => {
        ipcRenderer.removeAllListeners('game-data')
      }
    },
    addCue: (data: CreateCueDto) => ipcRenderer.invoke('add-cue', data),
    getCues: () => ipcRenderer.invoke('get-cues'),
    removeCue: (id: string) => ipcRenderer.invoke('remove-cue', id),
    updateLicense: (key: string) => ipcRenderer.invoke('update-license', key),
    getLicense: () => ipcRenderer.invoke('get-license'),
    createCuePack: (data: CreateCuePackDto) => ipcRenderer.invoke('create-cue-pack', data),
    activateCuePack: (id: string) => ipcRenderer.invoke('activate-cue-pack', id),
    getCuePacks: () => ipcRenderer.invoke('get-cue-packs'),
    getActiveCuePack: () => ipcRenderer.invoke('get-active-cue-pack')
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
