import 'dotenv/config'

import axios from 'axios'
import https from 'https'

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

const riotClient = createRiotClient()
const gameDetector = new GameDetector(riotClient)
const reminderService = new ReminderService()
const emitter = new EventEmitter()
const dispatcher = new Dispatcher(emitter)
const textToSpeech = new SayTextToSpeech()
const reminderProcessor = new ReminderProcessor(textToSpeech)
const objectiveTracker = new ObjectiveTracker()
const reminderOrchestrator = new ReminderOrchestrator(
  reminderService,
  reminderProcessor,
  objectiveTracker
)

export const gameAssistant = new GameAssistant(
  gameDetector,
  dispatcher,
  riotClient,
  reminderOrchestrator,
  reminderService
)
