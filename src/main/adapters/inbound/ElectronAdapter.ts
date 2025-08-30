import { BrowserWindow, type IpcMain } from 'electron'
import { CreateCueDto, CreateCuePackDto, IAppController } from '../../hexagon'

export class ElectronAdapter {
  private _configured: boolean = false

  public constructor(private readonly _appController: IAppController) {}

  public async setup(ipcMain: IpcMain): Promise<void> {
    if (this._configured) {
      return
    }

    ipcMain.handle('remove-cue-pack', async (_, id: string) => {
      return this._appController.removeCuePack(id)
    })

    ipcMain.handle('create-cue-pack', async (_, data: CreateCuePackDto) => {
      return this._appController.createCuePack(data)
    })

    ipcMain.handle('activate-cue-pack', async (_, id: string) => {
      return this._appController.activateCuePack(id)
    })

    ipcMain.handle('get-cue-packs', async () => {
      return this._appController.getCuePacks()
    })

    ipcMain.handle('get-active-cue-pack', async () => {
      return this._appController.getActiveCuePack()
    })

    ipcMain.handle('add-cue', async (_, data: CreateCueDto) => {
      return this._appController.addCue(data)
    })

    ipcMain.handle('get-cues', async () => {
      return this._appController.getCues()
    })

    ipcMain.handle('remove-cue', async (_, id: string) => {
      return this._appController.removeCue(id)
    })

    ipcMain.handle('update-license', async (_, key: string) => {
      return this._appController.updateLicense(key)
    })

    ipcMain.handle('get-license', async () => {
      return this._appController.getLicense()
    })

    this._appController.onGameTick((evt) => {
      BrowserWindow.getAllWindows().forEach((window) => {
        window.webContents.send('game-data', evt)
      })
    })

    this._appController.onGameStarted((evt) => {
      BrowserWindow.getAllWindows().forEach((window) => {
        window.webContents.send('game-data', evt)
      })
    })

    this._appController.onGameStopped((evt) => {
      BrowserWindow.getAllWindows().forEach((window) => {
        window.webContents.send('game-data', evt)
      })
    })

    await this._appController.start()
    this._configured = true
  }

  [Symbol.asyncDispose](): Promise<void> {
    return this._appController.stop()
  }
}
