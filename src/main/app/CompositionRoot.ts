import { CoachingModule } from './coaching'
import { App } from './App'

export function createApp(): App {
  const coachingModule = new CoachingModule()
  return new App(coachingModule)
}
