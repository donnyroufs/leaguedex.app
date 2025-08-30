import path from 'path'
import axios from 'axios'
import { app, IpcMain } from 'electron'

import * as Hexagon from './hexagon'
import * as Outbound from './adapters/outbound'

import { getLicenseKey } from './getLicenseKey'
import { ElectronAdapter } from './adapters/inbound'

/**
 * Dependencies we allow to be overridden.
 */
type AppDependencies = {
  eventBus: Hexagon.IEventBus
  dataSource: Outbound.IRiotClientDataSource
  timer: Hexagon.ITimer
  logger: Hexagon.ILogger
  audioPlayer: Hexagon.IAudioPlayer
  tts: Hexagon.ITextToSpeechGenerator
  cuePackRepository: Hexagon.ICuePackRepository
}

export class CompositionRoot {
  private _dataPath!: string
  private _created: boolean = false
  private _isProd!: boolean

  public constructor(private readonly _dependencies: Partial<AppDependencies> = {}) {}

  public async create(isProd: boolean): Promise<Hexagon.IAppController> {
    if (this._created) {
      throw new Error('Root already created')
    }

    this._dataPath = isProd ? app.getPath('userData') : path.join(process.cwd(), 'data')
    this._isProd = isProd

    const licenseKey = await getLicenseKey()
    const logger =
      this._dependencies.logger ??
      new Outbound.ElectronLogger(path.join(this._dataPath, 'logs.log'), 'info')
    const eventBus = this._dependencies.eventBus ?? new Outbound.EventBus(logger)

    const dataSource =
      this._dependencies.dataSource ?? (await Outbound.DataSourceFactory.create(isProd))
    const gameDataProvider = new Outbound.RiotLiveClientApi(dataSource)

    const timer = this._dependencies.timer ?? new Outbound.Timer()
    const gameMonitor = new Hexagon.GameMonitor(logger, timer, eventBus, gameDataProvider)

    const audioPlayer = this._dependencies.audioPlayer ?? new Outbound.AudioPlayer(logger, isProd)
    const audioDir = path.join(this._dataPath, 'audio')

    const axiosInstance = axios.create({
      baseURL: isProd ? 'https://api.leaguedex.app' : 'http://localhost:5005'
    })
    const tts =
      this._dependencies.tts ??
      (await Outbound.AudioGeneratorFactory.create(
        isProd,
        audioDir,
        licenseKey,
        axiosInstance,
        logger
      ))

    const cuePackRepository =
      this._dependencies.cuePackRepository ?? new Outbound.FakeCuePackRepository()
    const getCuePacksUseCase = new Hexagon.GetCuePacksUseCase(cuePackRepository)
    const createCuePackUseCase = new Hexagon.CreateCuePackUseCase(cuePackRepository, eventBus)
    const getActiveCuePackUseCase = new Hexagon.GetActiveCuePackUseCase(cuePackRepository)
    const activateCuePackUseCase = new Hexagon.ActivateCuePackUseCase(cuePackRepository)
    const cuePackService = new Hexagon.CuePackService(
      createCuePackUseCase,
      activateCuePackUseCase,
      getCuePacksUseCase,
      getActiveCuePackUseCase,
      eventBus,
      logger
    )

    const addCueToPackUseCase = new Hexagon.AddCueToPackUseCase(tts, cuePackRepository)
    const getCuesUseCase = new Hexagon.GetCuesUseCase(cuePackRepository)
    const removeCueUseCase = new Hexagon.RemoveCueUseCase(cuePackRepository)

    const cueService = new Hexagon.CueService(
      addCueToPackUseCase,
      getCuesUseCase,
      removeCueUseCase,
      eventBus,
      audioPlayer,
      logger,
      cuePackRepository
    )

    const appController = new Hexagon.AppController(
      gameMonitor,
      logger,
      cueService,
      eventBus,
      cuePackService
    )
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

async function createApp(
  overrides: Partial<AppDependencies>,
  isProd: boolean
): Promise<Hexagon.IAppController> {
  const root = new CompositionRoot(overrides)
  return root.create(isProd)
}

export async function createTestApp(
  overrides: Partial<AppDependencies>
): Promise<Hexagon.IAppController> {
  if (overrides?.logger == null) {
    overrides.logger = new Outbound.NullLogger()
  }

  if (overrides.tts == null) {
    overrides.tts = new Outbound.DevSpeechGenerator()
  }

  const root = new CompositionRoot(overrides)

  return root.create(false)
}

export async function createElectronAppAndStart(ipcMain: IpcMain): Promise<ElectronAdapter> {
  const isProd = app.isPackaged
  const appController = await createApp({}, isProd)
  const adapter = new ElectronAdapter(appController)

  await adapter.setup(ipcMain)

  return adapter
}
