import path from 'path'
import axios from 'axios'
import { app, type IpcMain } from 'electron'

import * as Hexagon from './hexagon'
import * as Outbound from './adapters/outbound'
import * as Inbound from './adapters/inbound'

import { App } from './Leaguedex'
import { getLicenseKey } from './getLicenseKey'

type AppDependencies = {
  eventBus: Hexagon.IEventBus
  dataSource: Outbound.IRiotClientDataSource
  notifyElectron: Hexagon.INotifyElectron
  timer: Hexagon.ITimer
  reminderRepository: Hexagon.IReminderRepository
  logger: Hexagon.ILogger
  audioPlayer: Hexagon.IAudioPlayer
  tts: Hexagon.ITextToSpeechGenerator
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
  const logger =
    overrides.logger ?? new Outbound.ElectronLogger(path.join(dataPath, 'logs.log'), 'info')
  const eventBus = overrides.eventBus ?? new Outbound.EventBus(logger)
  const dataSource =
    overrides.dataSource ??
    (isProd
      ? new Outbound.RiotClientDataSource()
      : Outbound.SimulatedRiotClientDataSource.createAndStartGame(overrides.endTimer ?? 600))
  const gameDataProvider = new Outbound.RiotLiveClientApi(dataSource)
  const notifyElectron = overrides.notifyElectron ?? new Outbound.NotifyElectron()

  const timer = overrides.timer ?? new Outbound.Timer()
  const gameMonitor = new Hexagon.GameMonitor(logger, timer, eventBus, gameDataProvider)

  // Modules
  let reminderRepository: Hexagon.IReminderRepository

  if (isProd && overrides.reminderRepository == null) {
    reminderRepository = await Outbound.FileSystemReminderRepository.create(dataPath)
  } else {
    reminderRepository = overrides.reminderRepository ?? new Outbound.FakeReminderRepository()
  }

  const audioPlayer = overrides.audioPlayer ?? new Outbound.AudioPlayer(logger, isProd)
  const audioDir = path.join(dataPath, 'audio')
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

  tts = overrides.tts ?? tts

  const remindersGameTickListener = new Hexagon.RemindersGameTickListener(
    reminderRepository,
    audioPlayer,
    logger
  )
  const createReminderUseCase = new Hexagon.CreateReminderUseCase(tts, reminderRepository)
  const getRemindersUseCase = new Hexagon.GetRemindersUseCase(reminderRepository)
  const removeReminderUseCase = new Hexagon.RemoveReminderUseCase(reminderRepository)

  const reminderService = new Hexagon.ReminderService(
    createReminderUseCase,
    getRemindersUseCase,
    removeReminderUseCase,
    remindersGameTickListener,
    eventBus
  )

  if (isPackaged) {
    const os = await import('os')

    logger.info('app created', {
      dataPath,
      isPackaged,
      overrides,
      version: app.getVersion(),
      locale: app.getSystemLocale(),
      os: os.platform(),
      using: [
        tts.constructor.name,
        audioPlayer.constructor.name,
        dataSource.constructor.name,
        reminderRepository.constructor.name,
        timer.constructor.name
      ]
    })
  }

  return new App(gameMonitor, eventBus, notifyElectron, logger, reminderService)
}

export async function createTestApp(overrides: Partial<AppDependencies> = {}): Promise<App> {
  if (overrides?.logger == null) {
    overrides.logger = new Outbound.NullLogger()
  }

  if (overrides.tts == null) {
    overrides.tts = new Outbound.DevSpeechGenerator()
  }

  return createApp(overrides, false)
}

export async function createAppAndStart(ipcMain?: IpcMain): Promise<void> {
  const leaguedex = await createApp({}, app.isPackaged)

  if (ipcMain) {
    await Inbound.ElectronAdapter.setup(leaguedex, ipcMain)
  }

  await leaguedex.start()
}
