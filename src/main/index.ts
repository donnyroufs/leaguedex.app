import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { autoUpdater } from 'electron-updater'

import icon from '../../resources/icon.png?asset'

import { createAppAndStart } from './app/CompositionRoot'

function createWindow(): void {
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
  await createAppAndStart(ipcMain)

  ipcMain.handle('get-version', async () => {
    return app.getVersion()
  })

  electronApp.setAppUserModelId('com.leaguedex.app')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

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

  createWindow()
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
