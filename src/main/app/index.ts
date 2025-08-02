import 'dotenv/config'

import axios from 'axios'
import https from 'https'

import { FakeRiotClient } from './FakeRiotClient'
import { GameDetector } from './GameDetector'
import { RiotClient } from './RiotClient'
import { IRiotClient } from './IRiotClient'

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

export const compositionRoot = {
  gameDetector: new GameDetector(riotClient)
}
