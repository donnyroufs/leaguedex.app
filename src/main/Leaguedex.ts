import { createGameDataDto } from './shared-kernel/contracts'
import {
  ILogger,
  INotifyElectron,
  CreateReminderUseCase,
  CreateReminderDto,
  GetRemindersUseCase,
  RemindersGameTickListener,
  RemoveReminderUseCase,
  IReminderDto,
  GameStartedEvent,
  GameTickEvent,
  GameObjectiveTracker,
  IEventBus,
  GameMonitor
} from './hexagon'
import { app } from 'electron'
import path, { join } from 'path'
import { access, constants, readFile, writeFile } from 'fs/promises'
import { getLicenseKey, revalidateLicenseKey } from './getLicenseKey'

// TODO: This file is going to be pretty much removed. We will have our composition root that will initialize all the dependencies and that's it.
// Then we have controllers exposed as ports from the hexagon, and we can create adapters on top of them to hook it all up. This is becoming a god class.
export class App {
  public constructor(
    private readonly _gameMonitor: GameMonitor,
    private readonly _eventBus: IEventBus,
    private readonly _notifyElectron: INotifyElectron,
    private readonly _logger: ILogger,
    private readonly _createReminderUseCase: CreateReminderUseCase,
    private readonly _getRemindersUseCase: GetRemindersUseCase,
    private readonly _removeReminderUseCase: RemoveReminderUseCase,
    private readonly _remindersGameTickListener: RemindersGameTickListener,
    private readonly _gameObjectiveTracker: GameObjectiveTracker
  ) {}

  public async start(): Promise<void> {
    this._logger.info('app starting')

    this._eventBus.subscribe('game-started', this.onGameStarted.bind(this))
    this._eventBus.subscribe('game-stopped', this.onGameEnded.bind(this))
    this._eventBus.subscribe('game-tick', this.onGameTick.bind(this))

    this._gameMonitor.start()

    this._logger.info('app started')
  }

  public async stop(): Promise<void> {
    this._eventBus.unsubscribe('game-started', this.onGameStarted.bind(this))
    this._eventBus.unsubscribe('game-stopped', this.onGameEnded.bind(this))
    this._eventBus.unsubscribe('game-tick', this.onGameTick.bind(this))

    this._gameMonitor.stop()
    this._logger.info('app stopped')
  }

  public getReminders(): Promise<IReminderDto[]> {
    this._logger.info('getReminders')
    return this._getRemindersUseCase.execute()
  }

  public async addReminder(data: CreateReminderDto): Promise<string> {
    this._logger.info('addReminder', { data })
    return this._createReminderUseCase.execute(data)
  }

  public async removeReminder(id: string): Promise<void> {
    this._logger.info('removeReminder', { id })
    return this._removeReminderUseCase.execute(id)
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

  private async onGameStarted(evt: GameStartedEvent): Promise<void> {
    this._logger.info('onGameStarted')
    const data = createGameDataDto(true, evt.payload.gameTime)
    this._notifyElectron.notify(data.type, data)
  }

  private async onGameEnded(): Promise<void> {
    this._logger.info('onGameEnded')
    const data = createGameDataDto(false, null)

    this._gameObjectiveTracker.reset()
    this._notifyElectron.notify(data.type, data)
  }

  private async onGameTick(evt: GameTickEvent): Promise<void> {
    this._logger.info('onGameTick')
    const data = createGameDataDto(true, evt.payload.state.gameTime)
    this._notifyElectron.notify(data.type, data)

    this._gameObjectiveTracker.track(evt.payload.state)

    await this._remindersGameTickListener.handle(evt)
  }
}
