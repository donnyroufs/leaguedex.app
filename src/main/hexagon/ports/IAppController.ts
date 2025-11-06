import { GameDataDto } from '@contracts'
import { CreateCueDto } from '../AddCueToPackUseCase'
import { ICueDto } from '../ICueDto'
import { ICuePackDto } from '@hexagon/GetCuePacksUseCase'
import { CreateCuePackDto } from '@hexagon/CreateCuePackUseCase'
import { IUserSettingsDto } from '@hexagon/IUserSettingsDto'

export interface IAppController {
  start(): Promise<void>
  stop(): Promise<void>

  updateUserSettings(data: IUserSettingsDto): Promise<void>
  getUserSettings(): Promise<IUserSettingsDto>

  playCue(id: string): Promise<void>
  activateCuePack(id: string): Promise<void>
  createCuePack(data: CreateCuePackDto): Promise<string>
  importPack(code: string): Promise<void>
  exportPack(id: string): Promise<string>
  getActiveCuePack(): Promise<ICuePackDto | null>
  getCuePacks(): Promise<ICuePackDto[]>
  removeCuePack(id: string): Promise<void>
  addCue(data: CreateCueDto): Promise<string>
  getCues(): Promise<ICueDto[]>
  removeCue(id: string): Promise<void>
  regenerateAudio(): Promise<void>
  setRegenerateAudioCallback(callback: () => Promise<void>): void

  onGameTick(callback: (gameData: GameDataDto) => void): void
  onGameStarted(callback: (gameData: GameDataDto) => void): void
  onGameStopped(callback: (gameData: GameDataDto) => void): void
}
