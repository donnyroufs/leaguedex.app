import os from 'os'
import path from 'path'
import { app, type IpcMain } from 'electron'

import { FileSystemReminderRepository, FakeReminderRepository } from './adapters/outbound'
import { IReminderRepository } from './hexagon'
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
import { TextToSpeech } from './adapters/outbound'
import { AudioPlayer } from './adapters/outbound'
import { ElectronLogger } from './adapters/outbound'
import {
  IRiotClientDataSource,
  RiotClientDataSource,
  SimulatedRiotClientDataSource,
  RiotApi
} from './adapters/outbound/riot-api'
import { ITextToSpeech } from './hexagon'
import { ITimer } from './hexagon'
import { CreateReminderUseCase } from './hexagon'
import { GetRemindersUseCase } from './hexagon'
import { RemindersGameTickListener } from './hexagon'

type AppDependencies = {
  eventBus: IEventBus
  dataSource: IRiotClientDataSource
  notifyElectron: INotifyElectron
  timer: ITimer
  reminderRepository: IReminderRepository
  logger: ILogger
  audioPlayer: IAudioPlayer
  tts: ITextToSpeech
  endTimer: number
}

export async function createApp(
  overrides: Partial<AppDependencies> = {},
  isPackaged: boolean = false,
  platform: 'win32' | 'darwin' = 'win32'
): Promise<App> {
  const isProd = isPackaged || process.env.NODE_ENV === 'production'

  // Cross cutting concerns
  const dataPath = isPackaged ? app.getPath('userData') : path.join(process.cwd(), 'data')
  const logger = overrides.logger ?? new ElectronLogger(path.join(dataPath, 'logs.log'), 'info')
  const eventBus = overrides.eventBus ?? new EventBus(logger)
  const dataSource =
    overrides.dataSource ??
    (isProd
      ? new RiotClientDataSource()
      : SimulatedRiotClientDataSource.createAndStartGame(overrides.endTimer ?? 60))
  const riotApi = new RiotApi(dataSource)
  const notifyElectron = overrides.notifyElectron ?? new NotifyElectron()

  const timer = overrides.timer ?? new Timer()
  const gameDetectionService = new GameDetectionService(eventBus, riotApi, timer, logger)

  // Modules
  let reminderRepository: IReminderRepository

  if (isProd && overrides.reminderRepository == null) {
    reminderRepository = await FileSystemReminderRepository.create(dataPath)
  } else {
    reminderRepository = overrides.reminderRepository ?? new FakeReminderRepository()
  }

  const audioPlayer = overrides.audioPlayer ?? new AudioPlayer(logger)
  const tts =
    overrides.tts ?? (await TextToSpeech.create(logger, path.join(dataPath, 'audio'), platform))

  const remindersGameTickListener = new RemindersGameTickListener(
    reminderRepository,
    audioPlayer,
    logger
  )
  const createReminderUseCase = new CreateReminderUseCase(tts, reminderRepository)
  const getRemindersUseCase = new GetRemindersUseCase(reminderRepository)

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
    remindersGameTickListener
  )
}

export async function createTestApp(overrides: Partial<AppDependencies> = {}): Promise<App> {
  if (overrides?.logger == null) {
    overrides.logger = ElectronLogger.createNull()
  }

  if (overrides.tts == null) {
    overrides.tts = await TextToSpeech.create(
      ElectronLogger.createNull(),
      path.join('tmpaudio'),
      'darwin'
    )
  }

  return createApp(overrides, false)
}

export async function createAppAndStart(ipcMain?: IpcMain): Promise<void> {
  const leaguedex = await createApp({}, app.isPackaged, os.platform() as 'win32' | 'darwin')

  if (ipcMain) {
    await ElectronAdapter.setup(leaguedex, ipcMain)
  }

  await leaguedex.start()
}
