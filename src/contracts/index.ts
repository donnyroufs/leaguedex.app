export type { ICueDto } from '@hexagon/ICueDto'
export type { CreateCueDto } from '@hexagon/AddCueToPackUseCase'
export type { EditCueDto } from '@hexagon/EditCueInPackUseCase'
export type { CreateCuePackDto } from '@hexagon/CreateCuePackUseCase'
export type { ICuePackDto } from '@hexagon/GetCuePacksUseCase'
export type {
  IUserSettingsDto,
  SpeechEngineConfig,
  SpeechEngineInput,
  SpeechEngineView,
  LocalSpeechEngineConfig,
  OpenAISpeechEngineConfig,
  OpenAITtsModel,
  OpenAITtsVoice
} from '@hexagon/IUserSettingsDto'

export type GameDataDto = {
  type: 'game-data'
  started: boolean
  time: number | null
}
