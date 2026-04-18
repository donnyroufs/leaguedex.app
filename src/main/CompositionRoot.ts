import path from 'path'
import { app, IpcMain } from 'electron'

import * as Hexagon from './hexagon'
import * as Outbound from './adapters/outbound'

import { ElectronAdapter } from './adapters/inbound'
import { Result } from './shared-kernel'

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
  userSettingsRepository: Hexagon.IUserSettingsRepository
  speechEngineAdapter: Hexagon.ISpeechEngineAdapter
}

export class CompositionRoot {
  private _dataPath!: string
  private _audioDir!: string
  private _created: boolean = false
  private _isProd!: boolean
  private _logger!: Hexagon.ILogger
  private _tts!: Hexagon.ITextToSpeechGenerator
  private _cuePackRepository!: Hexagon.ICuePackRepository

  public constructor(private readonly _dependencies: Partial<AppDependencies> = {}) {}

  public async create(isProd: boolean): Promise<Hexagon.IAppController> {
    if (this._created) {
      throw new Error('Root already created')
    }

    this._dataPath = isProd ? app.getPath('userData') : path.join(process.cwd(), 'data')
    this._isProd = isProd

    this._logger =
      this._dependencies.logger ??
      new Outbound.ElectronLogger(path.join(this._dataPath, 'logs.log'), 'info')
    const eventBus = this._dependencies.eventBus ?? new Outbound.EventBus(this._logger)

    const dataSource =
      this._dependencies.dataSource ?? (await Outbound.DataSourceFactory.create(isProd))
    const gameDataProvider = new Outbound.RiotLiveClientApi(dataSource)

    const timer = this._dependencies.timer ?? new Outbound.Timer()
    const gameMonitor = new Hexagon.GameMonitor(this._logger, timer, eventBus, gameDataProvider)

    const audioPlayer =
      this._dependencies.audioPlayer ?? new Outbound.AudioPlayer(this._logger, isProd)
    this._audioDir = path.join(this._dataPath, 'audio')

    const userSettingsRepository =
      this._dependencies.userSettingsRepository ??
      (await Outbound.UserSettingsRepositoryFactory.create(isProd, this._dataPath))

    const initialSpeechConfig = isProd
      ? (await userSettingsRepository.load()).unwrap().speech
      : null

    let speechAdapter: Hexagon.ISpeechEngineAdapter | null =
      this._dependencies.speechEngineAdapter ?? null

    if (this._dependencies.tts != null) {
      this._tts = this._dependencies.tts
    } else {
      const initial = await Outbound.AudioGeneratorFactory.create(
        isProd,
        this._audioDir,
        this._logger,
        this._dataPath,
        initialSpeechConfig
      )
      const proxy = new Outbound.ConfigurableTtsProxy(initial)
      this._tts = proxy

      if (speechAdapter == null) {
        const localSherpaDir = isProd ? null : path.join(process.cwd(), 'resources', 'sherpa')
        const installer = new Outbound.SherpaModelInstaller(
          this._logger,
          this._dataPath,
          new Outbound.IpcModelDownloadProgressReporter(),
          localSherpaDir
        )
        speechAdapter = new Outbound.ElectronSpeechEngineAdapter(
          this._logger,
          isProd,
          this._audioDir,
          this._dataPath,
          proxy,
          installer
        )
      }
    }

    const speechEngineService = new Hexagon.SpeechEngineService(
      speechAdapter ?? new NoopSpeechEngineAdapter(),
      userSettingsRepository,
      this._logger
    )

    this._cuePackRepository =
      this._dependencies.cuePackRepository ??
      (await Outbound.CuePackRepositoryFactory.create(isProd, this._dataPath))
    const getCuePacksUseCase = new Hexagon.GetCuePacksUseCase(this._cuePackRepository)
    const createCuePackUseCase = new Hexagon.CreateCuePackUseCase(this._cuePackRepository)
    const getActiveCuePackUseCase = new Hexagon.GetActiveCuePackUseCase(this._cuePackRepository)
    const activateCuePackUseCase = new Hexagon.ActivateCuePackUseCase(this._cuePackRepository)
    const removeCuePackUseCase = new Hexagon.RemoveCuePackUseCase(this._cuePackRepository)
    const importPackUseCase = new Hexagon.ImportPackUseCase(
      this._cuePackRepository,
      this._tts,
      this._logger
    )
    const exportPackUseCase = new Hexagon.ExportPackUseCase(this._cuePackRepository)
    const renameCuePackUseCase = new Hexagon.RenameCuePackUseCase(this._cuePackRepository)

    const cuePackService = new Hexagon.CuePackService(
      createCuePackUseCase,
      activateCuePackUseCase,
      getCuePacksUseCase,
      getActiveCuePackUseCase,
      this._logger,
      removeCuePackUseCase,
      importPackUseCase,
      exportPackUseCase,
      renameCuePackUseCase
    )

    const addCueToPackUseCase = new Hexagon.AddCueToPackUseCase(this._tts, this._cuePackRepository)
    const getCuesUseCase = new Hexagon.GetCuesUseCase(this._cuePackRepository)
    const removeCueUseCase = new Hexagon.RemoveCueUseCase(this._cuePackRepository)
    const editCueInPackUseCase = new Hexagon.EditCueInPackUseCase(
      this._tts,
      this._cuePackRepository
    )

    const cueProcessor = new Hexagon.CueProcessor(
      audioPlayer,
      this._logger,
      userSettingsRepository,
      this._audioDir
    )

    const cueService = new Hexagon.CueService(
      addCueToPackUseCase,
      getCuesUseCase,
      removeCueUseCase,
      editCueInPackUseCase,
      eventBus,
      audioPlayer,
      this._logger,
      this._cuePackRepository,
      userSettingsRepository,
      cueProcessor,
      this._audioDir
    )

    const fileSystem = new Outbound.FileSystem()
    const progressReporter = new Outbound.IpcAudioRegenerationProgressReporter()
    const regenerateAudioUseCase = new Hexagon.RegenerateAudioUseCase(
      this._cuePackRepository,
      this._tts,
      progressReporter,
      this._logger,
      fileSystem,
      this._audioDir
    )

    const appController = new Hexagon.AppController(
      gameMonitor,
      this._logger,
      cueService,
      eventBus,
      cuePackService,
      userSettingsRepository,
      regenerateAudioUseCase,
      speechEngineService
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

/**
 * Used when a test overrides `tts` directly and doesn't care about runtime switching.
 * All speech-engine management calls become no-ops / unsupported.
 */
class NoopSpeechEngineAdapter implements Hexagon.ISpeechEngineAdapter {
  public encryptApiKey(): string {
    throw new Error('Speech engine management is disabled in this context.')
  }
  public decryptApiKey(): string {
    throw new Error('Speech engine management is disabled in this context.')
  }
  public maskApiKey(): string {
    return '••••••••'
  }
  public isLocalInstalled(): boolean {
    return true
  }
  public async installLocal(): Promise<Result<void, Error>> {
    return Result.err(new Error('Speech engine management is disabled in this context.'))
  }
  public async buildGenerator(): Promise<Hexagon.ITextToSpeechGenerator> {
    throw new Error('Speech engine management is disabled in this context.')
  }
  public reconfigureTts(): void {
    // no-op
  }
  public async testOpenAI(): Promise<Result<void, Error>> {
    return Result.err(new Error('Speech engine management is disabled in this context.'))
  }
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
  const root = new CompositionRoot({})
  const appController = await root.create(isProd)
  const adapter = new ElectronAdapter(appController)

  await adapter.setup(ipcMain)

  return adapter
}
