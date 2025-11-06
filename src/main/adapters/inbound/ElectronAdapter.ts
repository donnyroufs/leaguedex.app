import { BrowserWindow, type IpcMain } from 'electron'
import { IAppController } from '../../hexagon'
import { IUserSettingsDto, CreateCueDto, CreateCuePackDto } from '@contracts'
import { CompositionRoot } from '../../CompositionRoot'
import { IpcAudioRegenerationProgressReporter } from './IpcAudioRegenerationProgressReporter'

export class ElectronAdapter {
  private _configured: boolean = false

  public constructor(
    private readonly _appController: IAppController,
    private readonly _compositionRoot: CompositionRoot
  ) {}

  public async setup(ipcMain: IpcMain): Promise<void> {
    if (this._configured) {
      return
    }

    ipcMain.handle('update-user-settings', async (_, data: IUserSettingsDto) => {
      return this._appController.updateUserSettings(data)
    })

    ipcMain.handle('get-user-settings', async () => {
      return this._appController.getUserSettings()
    })

    ipcMain.handle('play-cue', async (_, id: string) => {
      return this._appController.playCue(id)
    })

    ipcMain.handle('export-pack', async (_, id: string) => {
      return this._appController.exportPack(id)
    })

    ipcMain.handle('import-pack', async (_, code: string) => {
      return this._appController.importPack(code)
    })

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

    ipcMain.handle('regenerate-audio', async (event) => {
      const window = BrowserWindow.fromWebContents(event.sender)
      if (!window) {
        throw new Error('Window not found')
      }

      const progressReporter = new IpcAudioRegenerationProgressReporter(window)
      const regenerateUseCase = this._compositionRoot.createRegenerateAudioUseCase(progressReporter)

      // Set the callback on AppController
      this._appController.setRegenerateAudioCallback(() => regenerateUseCase.execute())

      return this._appController.regenerateAudio()
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
