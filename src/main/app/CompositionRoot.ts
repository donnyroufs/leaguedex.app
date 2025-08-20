import { app, type IpcMain } from 'electron'
import { CoachingModule, FileSystemReminderRepository, IReminderRepository } from './coaching'
import { App } from './App'

import {
  ElectronAdapter,
  EventBus,
  GameDetectionService,
  IEventBus,
  INotifyElectron,
  IRiotClientDataSource,
  ITimer,
  NotifyElectron,
  RiotApi,
  RiotClientDataSource,
  SimulatedRiotClientDataSource,
  Timer
} from './shared-kernel'
import path from 'path'
import { ElectronLogger } from './shared-kernel/ElectronLogger'
import { ILogger } from './shared-kernel/ILogger'

type AppDependencies = {
  eventBus: IEventBus
  dataSource: IRiotClientDataSource
  notifyElectron: INotifyElectron
  timer: ITimer
  reminderRepository: IReminderRepository
  logger: ILogger
}

export async function createApp(
  overrides: Partial<AppDependencies> = {},
  isPackaged: boolean = false
): Promise<App> {
  const isProd = isPackaged || process.env.NODE_ENV === 'production'

  // Cross cutting concerns
  const dataPath = isPackaged ? app.getPath('userData') : path.join(process.cwd(), 'data')
  const logger = overrides.logger ?? new ElectronLogger(path.join(dataPath, 'logs.log'), 'info')
  const eventBus = overrides.eventBus ?? new EventBus(logger)
  const dataSource =
    overrides.dataSource ??
    (isProd ? new RiotClientDataSource() : SimulatedRiotClientDataSource.create(eventBus))
  const riotApi = new RiotApi(dataSource)
  const notifyElectron = overrides.notifyElectron ?? new NotifyElectron()

  // Game Detection
  const timer = overrides.timer ?? new Timer()
  const gameDetectionService = new GameDetectionService(eventBus, riotApi, timer, logger)

  // Modules
  const reminderRepository =
    overrides.reminderRepository ?? (await FileSystemReminderRepository.create(dataPath))
  const coachingModule = new CoachingModule(reminderRepository)

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

  return new App(coachingModule, gameDetectionService, eventBus, notifyElectron, logger)
}

export async function createTestApp(overrides: Partial<AppDependencies> = {}): Promise<App> {
  if (overrides?.logger == null) {
    overrides.logger = ElectronLogger.createNull()
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
