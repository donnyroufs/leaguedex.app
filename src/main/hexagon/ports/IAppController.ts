import { GameDataDto } from '@contracts'
import { CreateCueDto } from '../CreateCueUseCase'
import { ICueDto } from '../ICueDto'

export interface IAppController {
  start(): Promise<void>
  stop(): Promise<void>

  addCue(data: CreateCueDto): Promise<string>
  getCues(): Promise<ICueDto[]>
  removeCue(id: string): Promise<void>
  getLicense(): Promise<string>
  updateLicense(key: string): Promise<void>

  onGameTick(callback: (gameData: GameDataDto) => void): void
  onGameStarted(callback: (gameData: GameDataDto) => void): void
  onGameStopped(callback: (gameData: GameDataDto) => void): void
}
