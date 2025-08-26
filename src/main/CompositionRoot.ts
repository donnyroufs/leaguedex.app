import path from 'path'
import { app, type IpcMain } from 'electron'

import {
  FileSystemReminderRepository,
  FakeReminderRepository,
  NativeWindowsSpeechGenerator,
  OpenAISpeechGenerator,
  DevSpeechGenerator
} from './adapters/outbound'
import { GameObjectiveTracker, IReminderRepository, RemoveReminderUseCase } from './hexagon'
import { App } from './Leaguedex'
import { ElectronAdapter } from './adapters/inbound'
import { EventBus } from './adapters/outbound'
import { GameDetectionService } from './hexagon'
import { IEventBus } from './hexagon'
import { INotifyElectron } from './hexagon'
import { NotifyElectron } from './adapters/outbound'
import { Timer } from './adapters/outbound'
import { ILogger } from './hexagon'
import { IAudioPlayer } from './hexagon'
import { AudioPlayer } from './adapters/outbound'
import { ElectronLogger } from './adapters/outbound'
import {
  IRiotClientDataSource,
  RiotClientDataSource,
  SimulatedRiotClientDataSource,
  RiotLiveClientApi
} from './adapters/outbound/game-data'
import { ITextToSpeechGenerator } from './hexagon'
import { ITimer } from './hexagon'
import { CreateReminderUseCase } from './hexagon'
import { GetRemindersUseCase } from './hexagon'
import { RemindersGameTickListener } from './hexagon'
import axios from 'axios'
import { getLicenseKey } from './getLicenseKey'

type AppDependencies = {
  eventBus: IEventBus
  dataSource: IRiotClientDataSource
  notifyElectron: INotifyElectron
  timer: ITimer
  reminderRepository: IReminderRepository
  logger: ILogger
  audioPlayer: IAudioPlayer
  tts: ITextToSpeechGenerator
  endTimer: number
}

export async function createApp(
  overrides: Partial<AppDependencies> = {},
  isPackaged: boolean = false
): Promise<App> {
  const isProd = isPackaged || process.env.NODE_ENV === 'production'

  const axiosInstance = axios.create({
    baseURL: 'http://api.donnyroufs.com'
  })

  // Cross cutting concerns
  const dataPath = isPackaged ? app.getPath('userData') : path.join(process.cwd(), 'data')
  const logger = overrides.logger ?? new ElectronLogger(path.join(dataPath, 'logs.log'), 'info')
  const eventBus = overrides.eventBus ?? new EventBus(logger)
  const dataSource =
    overrides.dataSource ??
    (isProd
      ? new RiotClientDataSource()
      : SimulatedRiotClientDataSource.createAndStartGame(overrides.endTimer ?? 600))
  const gameDataProvider = new RiotLiveClientApi(dataSource)
  const notifyElectron = overrides.notifyElectron ?? new NotifyElectron()

  const timer = overrides.timer ?? new Timer()
  const gameDetectionService = new GameDetectionService(eventBus, gameDataProvider, timer, logger)

  // Modules
  let reminderRepository: IReminderRepository

  if (isProd && overrides.reminderRepository == null) {
    reminderRepository = await FileSystemReminderRepository.create(dataPath)
  } else {
    reminderRepository = overrides.reminderRepository ?? new FakeReminderRepository()
  }

  const audioPlayer = overrides.audioPlayer ?? new AudioPlayer(logger, isProd)
  const audioDir = path.join(dataPath, 'audio')
  let tts: ITextToSpeechGenerator

  const licenseKey = await getLicenseKey()

  // TODO: if we enter a license key we might have to update, or restart the app.
  if (isProd && licenseKey.length > 0) {
    tts = OpenAISpeechGenerator.create(axiosInstance, audioDir)
  } else if (isProd && !licenseKey) {
    tts = await NativeWindowsSpeechGenerator.create(logger, audioDir)
  } else {
    tts = new DevSpeechGenerator()
  }

  tts = overrides.tts ?? tts

  const gameObjectiveTracker = new GameObjectiveTracker(logger)
  const remindersGameTickListener = new RemindersGameTickListener(
    reminderRepository,
    audioPlayer,
    logger,
    gameObjectiveTracker
  )
  const createReminderUseCase = new CreateReminderUseCase(tts, reminderRepository)
  const getRemindersUseCase = new GetRemindersUseCase(reminderRepository)
  const removeReminderUseCase = new RemoveReminderUseCase(reminderRepository)

  if (isPackaged) {
    const os = await import('os')

    logger.info('app created', {
      dataPath,
      isPackaged,
      overrides,
      version: app.getVersion(),
      locale: app.getSystemLocale(),
      os: os.platform()
    })
  }

  return new App(
    gameDetectionService,
    eventBus,
    notifyElectron,
    logger,
    createReminderUseCase,
    getRemindersUseCase,
    removeReminderUseCase,
    remindersGameTickListener,
    gameObjectiveTracker
  )
}

export async function createTestApp(overrides: Partial<AppDependencies> = {}): Promise<App> {
  if (overrides?.logger == null) {
    overrides.logger = ElectronLogger.createNull()
  }

  if (overrides.tts == null) {
    overrides.tts = new DevSpeechGenerator()
  }

  return createApp(overrides, false)
}

export async function createAppAndStart(ipcMain?: IpcMain): Promise<void> {
  const leaguedex = await createApp({}, app.isPackaged)

  if (ipcMain) {
    await ElectronAdapter.setup(leaguedex, ipcMain)
  }

  await leaguedex.start()
}
