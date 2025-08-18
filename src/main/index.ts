import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { autoUpdater } from 'electron-updater'
import icon from '../../resources/icon.png?asset'

import * as GameAssistance from './app/game-assistance'
import { CreateReminder } from './app/game-assistance/GameAssistant'
import { UserConfig, UserConfigRepository } from './app/UserConfig'
import { createApp } from './app/CompositionRoot'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1200,
    minHeight: 800,
    maxWidth: 1600,
    maxHeight: 1000,
    show: false,
    frame: false, // Remove the default titlebar
    titleBarStyle: 'hidden',
    icon,
    autoHideMenuBar: true,
    center: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  // Set Content Security Policy to allow Riot Games API
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https://ddragon.leagueoflegends.com https://*.riotgames.com; img-src 'self' data: https://ddragon.leagueoflegends.com; script-src 'self' 'unsafe-inline' 'unsafe-eval';"
        ]
      }
    })
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  const dexService = GameAssistance.createDexService()

  const leaguedexApp = createApp()
  await leaguedexApp.start()

  // Set app user model id for windows
  // TODO: Revisit this
  electronApp.setAppUserModelId('com.leaguedex.app')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Window control handlers
  ipcMain.on('window-minimize', () => {
    const focusedWindow = BrowserWindow.getFocusedWindow()
    if (focusedWindow) focusedWindow.minimize()
  })

  ipcMain.on('window-maximize', () => {
    const focusedWindow = BrowserWindow.getFocusedWindow()
    if (focusedWindow) {
      if (focusedWindow.isMaximized()) {
        focusedWindow.unmaximize()
      } else {
        focusedWindow.maximize()
      }
    }
  })

  ipcMain.on('window-close', () => {
    const focusedWindow = BrowserWindow.getFocusedWindow()
    if (focusedWindow) focusedWindow.close()
  })

  createWindow()

  const configRepository = UserConfigRepository.create()
  const gameAssistant = GameAssistance.createGameAssistant(configRepository)

  // gameAssistant
  //   .on('game-data', async (data) => {
  //     BrowserWindow.getAllWindows().forEach((window) => {
  //       window.webContents.send('game-data', { ...data })
  //     })
  //   })
  //   .start()

  ipcMain.handle('update-config', async (_, config: UserConfig) => {
    await configRepository.update(config)
    return configRepository.getConfig()
  })

  ipcMain.handle(
    'review-game',
    async (_, gameId: string, data: { matchupNotes: string; generalNotes: string }) => {
      return gameAssistant.reviewGame(gameId, data.matchupNotes, data.generalNotes)
    }
  )

  ipcMain.handle('dex-all', async () => {
    return dexService.all()
  })

  ipcMain.handle('get-config', async () => {
    return configRepository.getConfig()
  })

  ipcMain.handle('add-reminder', async (_, reminder: CreateReminder) => {
    return gameAssistant.addReminder(reminder)
  })

  ipcMain.handle('get-version', async () => {
    return app.getVersion()
  })

  ipcMain.handle('remove-reminder', async (_, id: string) => {
    return gameAssistant.removeReminder(id)
  })

  ipcMain.handle('get-reminders', async () => {
    return gameAssistant.getReminders()
  })

  ipcMain.handle('get-games', async () => {
    return gameAssistant.getAllGames()
  })

  // Configure auto-updater
  if (!is.dev) {
    autoUpdater.setFeedURL({
      provider: 'spaces',
      name: 'leaguedex-releases',
      region: 'ams3',
      acl: 'public-read'
    })
    autoUpdater.checkForUpdatesAndNotify()

    autoUpdater.on('checking-for-update', () => {
      BrowserWindow.getAllWindows().forEach((window) => {
        window.webContents.send('update-status', { status: 'checking' })
      })
    })

    autoUpdater.on('update-available', (info) => {
      BrowserWindow.getAllWindows().forEach((window) => {
        window.webContents.send('update-status', {
          status: 'available',
          version: info.version,
          releaseDate: info.releaseDate
        })
      })
    })

    autoUpdater.on('update-not-available', () => {
      BrowserWindow.getAllWindows().forEach((window) => {
        window.webContents.send('update-status', { status: 'not-available' })
      })
    })

    autoUpdater.on('error', (err) => {
      BrowserWindow.getAllWindows().forEach((window) => {
        window.webContents.send('update-status', {
          status: 'error',
          error: err.message
        })
      })
    })

    autoUpdater.on('download-progress', (progressObj) => {
      BrowserWindow.getAllWindows().forEach((window) => {
        window.webContents.send('update-status', {
          status: 'downloading',
          progress: progressObj.percent
        })
      })
    })

    autoUpdater.on('update-downloaded', () => {
      BrowserWindow.getAllWindows().forEach((window) => {
        window.webContents.send('update-status', { status: 'downloaded' })
      })
    })
  }

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// Add update handlers
ipcMain.handle('check-for-updates', async () => {
  if (!is.dev) {
    return autoUpdater.checkForUpdates()
  }
  return null
})

ipcMain.handle('download-update', async () => {
  if (!is.dev) {
    return autoUpdater.downloadUpdate()
  }
  return null
})

ipcMain.handle('install-update', async () => {
  if (!is.dev) {
    autoUpdater.quitAndInstall()
  }
})
