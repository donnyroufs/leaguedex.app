import { ILogger, GameMonitor, IAppController, IEventBus, CueService } from '.'
import { app } from 'electron'
import path, { join } from 'path'
import { access, constants, readFile, writeFile } from 'fs/promises'
import { getLicenseKey, revalidateLicenseKey } from '../getLicenseKey'
import { CreateCueDto, GameDataDto, ICueDto } from '@contracts'

export class AppController implements IAppController {
  public constructor(
    private readonly _gameMonitor: GameMonitor,
    private readonly _logger: ILogger,
    private readonly _cueService: CueService,
    private readonly _eventBus: IEventBus
  ) {}

  public async start(): Promise<void> {
    await this._gameMonitor.start()
    await this._cueService.start()

    this._logger.info('app started')
  }

  public async stop(): Promise<void> {
    await this._gameMonitor.stop()
    await this._cueService.stop()
    this._logger.info('app stopped')
  }

  public getCues(): Promise<ICueDto[]> {
    this._logger.info('getCues')
    return this._cueService.getCues()
  }

  public async addCue(data: CreateCueDto): Promise<string> {
    this._logger.info('addCue', { data })
    return this._cueService.addCue(data)
  }

  public async removeCue(id: string): Promise<void> {
    this._logger.info('removeCue', { id })
    return this._cueService.removeCue(id)
  }

  public async getLicense(): Promise<string> {
    this._logger.info('getLicense')
    return getLicenseKey()
  }

  // temporary solution
  public async updateLicense(key: string): Promise<void> {
    this._logger.info('updateLicense')
    const dataPath = app.isPackaged ? app.getPath('userData') : path.join(process.cwd(), 'data')
    const licenseKeyPath = join(dataPath, 'settings.json')

    try {
      await access(licenseKeyPath, constants.F_OK)
    } catch {
      await writeFile(licenseKeyPath, JSON.stringify({ license: key }))
    } finally {
      try {
        const settings = JSON.parse(await readFile(licenseKeyPath, 'utf-8'))
        settings.license = key

        await writeFile(licenseKeyPath, JSON.stringify(settings))
        this._logger.info('license updated')
      } catch (err) {
        this._logger.error('error updating license', { err })
      }

      await revalidateLicenseKey()
    }
  }

  public onGameTick(callback: (gameData: GameDataDto) => void): void {
    this._eventBus.subscribe('game-tick', (evt) => {
      callback({
        type: 'game-data',
        started: true,
        time: evt.payload.state.gameTime
      })
    })
  }

  public onGameStarted(callback: (gameData: GameDataDto) => void): void {
    this._eventBus.subscribe('game-started', (evt) => {
      callback({
        type: 'game-data',
        started: true,
        time: evt.payload.gameTime
      })
    })
  }

  public onGameStopped(callback: (gameData: GameDataDto) => void): void {
    this._eventBus.subscribe('game-stopped', () => {
      callback({
        type: 'game-data',
        started: false,
        time: null
      })
    })
  }
}
