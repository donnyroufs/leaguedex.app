import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { Reminder } from '../main/app/Reminder'

const api = {
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  gameAssistant: {
    onGameData: (callback: (data: { playing: boolean; gameTime: number | null }) => void) => {
      ipcRenderer.on('game-data', (_, data) => {
        callback(data)
      })

      return () => {
        ipcRenderer.removeAllListeners('game-data')
      }
    },
    getReminders: () => ipcRenderer.invoke('get-reminders'),
    addReminder: (reminder: Reminder) => ipcRenderer.invoke('add-reminder', reminder),
    removeReminder: (id: string) => ipcRenderer.invoke('remove-reminder', id)
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
