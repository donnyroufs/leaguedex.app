import {
  ILogger,
  CreateReminderDto,
  IReminderDto,
  GameMonitor,
  ReminderService,
  IAppController,
  IEventBus
} from './hexagon'
import { app } from 'electron'
import path, { join } from 'path'
import { access, constants, readFile, writeFile } from 'fs/promises'
import { getLicenseKey, revalidateLicenseKey } from './getLicenseKey'
import { createGameDataDto, GameDataDto } from './shared-kernel/contracts'

export class AppController implements IAppController {
  public constructor(
    private readonly _gameMonitor: GameMonitor,
    private readonly _logger: ILogger,
    private readonly _reminderService: ReminderService,
    private readonly _eventBus: IEventBus
  ) {}

  public async start(): Promise<void> {
    await this._gameMonitor.start()
    await this._reminderService.start()

    this._logger.info('app started')
  }

  public async stop(): Promise<void> {
    this._gameMonitor.stop()
    this._reminderService.stop()
    this._logger.info('app stopped')
  }

  public getReminders(): Promise<IReminderDto[]> {
    this._logger.info('getReminders')
    return this._reminderService.getReminders()
  }

  public async addReminder(data: CreateReminderDto): Promise<string> {
    this._logger.info('addReminder', { data })
    return this._reminderService.addReminder(data)
  }

  public async removeReminder(id: string): Promise<void> {
    this._logger.info('removeReminder', { id })
    return this._reminderService.removeReminder(id)
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
      const data = createGameDataDto(true, evt.payload.state.gameTime)
      callback(data)
    })
  }

  public onGameStarted(callback: (gameData: GameDataDto) => void): void {
    this._eventBus.subscribe('game-started', (evt) => {
      const data = createGameDataDto(true, evt.payload.gameTime)
      callback(data)
    })
  }

  public onGameStopped(callback: (gameData: GameDataDto) => void): void {
    this._eventBus.subscribe('game-stopped', () => {
      const data = createGameDataDto(false, null)
      callback(data)
    })
  }
}
