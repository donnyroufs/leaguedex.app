import type { SpeechEngineConfig } from './IUserSettingsDto'

export type UserSettings = {
  volume: number
  speech: SpeechEngineConfig | null
}
