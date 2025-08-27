import path from 'path'
import axios from 'axios'
import { app, IpcMain } from 'electron'

import * as Hexagon from './hexagon'
import * as Outbound from './adapters/outbound'

import { AppController } from './adapters/inbound/AppController'
import { getLicenseKey } from './getLicenseKey'
import { ElectronAdapter } from './adapters/inbound'

type AppDependencies = {
  eventBus: Hexagon.IEventBus
  dataSource: Outbound.IRiotClientDataSource
  timer: Hexagon.ITimer
  reminderRepository: Hexagon.IReminderRepository
  logger: Hexagon.ILogger
  audioPlayer: Hexagon.IAudioPlayer
  tts: Hexagon.ITextToSpeechGenerator
}

export class CompositionRoot {
  private _dataPath!: string
  private _created: boolean = false
  private _isProd!: boolean

  public constructor(private readonly _dependencies: Partial<AppDependencies> = {}) {}

  public async create(isProd: boolean): Promise<AppController> {
    if (this._created) {
      throw new Error('Root already created')
    }

    // TODO: check if DOMAIN is working now
    // TODO: in dev we hit localhost!
    const axiosInstance = axios.create({
      baseURL: 'http://api.leaguedex.app'
    })

    // Cross cutting concerns
    this._dataPath = isProd ? app.getPath('userData') : path.join(process.cwd(), 'data')
    this._isProd = isProd

    const logger =
      this._dependencies.logger ??
      new Outbound.ElectronLogger(path.join(this._dataPath, 'logs.log'), 'info')
    const eventBus = this._dependencies.eventBus ?? new Outbound.EventBus(logger)
    const dataSource =
      this._dependencies.dataSource ??
      (isProd
        ? new Outbound.RiotClientDataSource()
        : Outbound.SimulatedRiotClientDataSource.createAndStartGame(600, 0, true))
    const gameDataProvider = new Outbound.RiotLiveClientApi(dataSource)

    const timer = this._dependencies.timer ?? new Outbound.Timer()
    const gameMonitor = new Hexagon.GameMonitor(logger, timer, eventBus, gameDataProvider)

    let reminderRepository: Hexagon.IReminderRepository

    if (isProd && this._dependencies.reminderRepository == null) {
      reminderRepository = await Outbound.FileSystemReminderRepository.create(this._dataPath)
    } else {
      reminderRepository =
        this._dependencies.reminderRepository ?? new Outbound.FakeReminderRepository()
    }

    const audioPlayer = this._dependencies.audioPlayer ?? new Outbound.AudioPlayer(logger, isProd)
    const audioDir = path.join(this._dataPath, 'audio')
    let tts: Hexagon.ITextToSpeechGenerator

    const licenseKey = await getLicenseKey()

    // TODO: if we enter a license key we might have to update, or restart the app.
    if (isProd && licenseKey.length > 0) {
      tts = Outbound.OpenAISpeechGenerator.create(axiosInstance, audioDir)
    } else if (isProd && !licenseKey) {
      tts = await Outbound.NativeWindowsSpeechGenerator.create(logger, audioDir)
    } else {
      tts = new Outbound.DevSpeechGenerator()
    }

    tts = this._dependencies.tts ?? tts

    const createReminderUseCase = new Hexagon.CreateReminderUseCase(tts, reminderRepository)
    const getRemindersUseCase = new Hexagon.GetRemindersUseCase(reminderRepository)
    const removeReminderUseCase = new Hexagon.RemoveReminderUseCase(reminderRepository)

    const reminderService = new Hexagon.ReminderService(
      createReminderUseCase,
      getRemindersUseCase,
      removeReminderUseCase,
      eventBus,
      audioPlayer,
      logger,
      reminderRepository
    )

    const appController = new AppController(gameMonitor, logger, reminderService, eventBus)
    this._created = true
    return appController
  }

  public getMetadata(): {
    dataPath: string
    isProd: boolean
    version: string
    locale: string
    using: string[]
  } {
    if (!this._created) {
      throw new Error('Root not created')
    }

    return {
      dataPath: this._dataPath,
      isProd: this._isProd,
      version: app.getVersion(),
      locale: app.getSystemLocale(),
      using: Object.values(this._dependencies).map((x) => x.constructor.name)
    }
  }
}

export async function createApp(
  overrides: Partial<AppDependencies>,
  isProd: boolean
): Promise<AppController> {
  const root = new CompositionRoot(overrides)
  return root.create(isProd)
}

export async function createTestApp(overrides: Partial<AppDependencies>): Promise<AppController> {
  if (overrides?.logger == null) {
    overrides.logger = new Outbound.NullLogger()
  }

  if (overrides.tts == null) {
    overrides.tts = new Outbound.DevSpeechGenerator()
  }

  const root = new CompositionRoot(overrides)

  return root.create(false)
}

export async function createElectronAppAndStart(ipcMain: IpcMain): Promise<AppController> {
  const isProd = app.isPackaged
  const controller = await createApp({}, isProd)
  const adapter = new ElectronAdapter(controller)

  await adapter.setup(ipcMain)
  await controller.start()

  return controller
}
