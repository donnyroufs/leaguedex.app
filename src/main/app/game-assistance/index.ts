import 'dotenv/config'

import { app } from 'electron'
import axios from 'axios'
import https from 'https'
import { join } from 'node:path'

import { FakeRiotClient } from './FakeRiotClient'
import { GameDetector } from './GameDetector'
import { RiotClient } from './RiotClient'
import { IRiotClient } from './IRiotClient'
import { ReminderService } from './ReminderService'
import { GameAssistant } from './GameAssistant'
import { Dispatcher } from './Dispatcher'
import EventEmitter from 'events'
import { SayTextToSpeech } from './SayTextToSpeech'
import { ReminderProcessor } from './ReminderProcessor'
import { ObjectiveTracker } from './ObjectiveTracker'
import { ReminderOrchestrator } from './ReminderOrchestrator'
import { UserConfigRepository } from '../UserConfig'
import { GameService } from '../GameService'
import { GameRepository } from '../GameRepository'
import { DexService } from '../DexService'
import { DeathTracker } from './DeathTracker'

const isDevelopment = process.env.NODE_ENV === 'development'

const httpClient = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
})

function createRiotClient(): IRiotClient {
  if (isDevelopment) {
    return new FakeRiotClient()
  }

  return new RiotClient(httpClient)
}

function createReminderService(): ReminderService {
  const path = app.isPackaged
    ? join(app.getPath('userData'), 'reminders.json')
    : join(__dirname, '../../dev-reminders.json')

  const service = new ReminderService(path)

  service.configure()

  return service
}

function createGameService(): GameService {
  const path = app.isPackaged
    ? join(app.getPath('userData'), 'games.json')
    : join(__dirname, '../../dev-games.json')

  const gameRepository = new GameRepository(path)
  gameRepository.configure()

  return new GameService(gameRepository)
}

const gameService = createGameService()

export function createDexService(): DexService {
  return new DexService(gameService)
}

export function createGameAssistant(configRepository: UserConfigRepository): GameAssistant {
  const riotClient = createRiotClient()
  const reminderService = createReminderService()
  const gameDetector = new GameDetector(riotClient)
  const emitter = new EventEmitter()
  const dispatcher = new Dispatcher(emitter)
  const textToSpeech = new SayTextToSpeech()
  const reminderProcessor = new ReminderProcessor(textToSpeech)
  const objectiveTracker = new ObjectiveTracker()
  const deathTracker = new DeathTracker()
  const reminderOrchestrator = new ReminderOrchestrator(
    reminderService,
    reminderProcessor,
    objectiveTracker,
    deathTracker
  )

  return new GameAssistant(
    gameDetector,
    dispatcher,
    riotClient,
    reminderOrchestrator,
    reminderService,
    configRepository,
    gameService
  )
}
