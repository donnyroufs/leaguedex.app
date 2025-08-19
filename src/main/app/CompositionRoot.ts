import { CoachingModule } from './coaching'
import { App } from './App'

import * as sharedKernel from './shared-kernel'

export function createApp(): App {
  // Modules
  const coachingModule = new CoachingModule()

  // Cross cutting concerns
  const eventBus = new sharedKernel.EventBus()
  const dataSource = sharedKernel.SimulatedRiotClientDataSource.create(eventBus)
  const riotApi = new sharedKernel.RiotApi(dataSource)
  const notifyElectron = new sharedKernel.NotifyElectron()

  // Game Detection
  const timer = new sharedKernel.Timer()
  const gameDetectionService = new sharedKernel.GameDetectionService(eventBus, riotApi, timer)

  return new App(coachingModule, gameDetectionService, eventBus, notifyElectron)
}

export async function createAppAndStart(): Promise<void> {
  const app = createApp()
  await app.start()
}
