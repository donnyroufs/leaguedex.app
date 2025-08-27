import { GameDataDto } from '@contracts'
import { CreateReminderDto } from '../CreateReminderUseCase'
import { IReminderDto } from '../ReminderDto'

export interface IAppController {
  addReminder(data: CreateReminderDto): Promise<string>
  getReminders(): Promise<IReminderDto[]>
  removeReminder(id: string): Promise<void>
  getLicense(): Promise<string>
  updateLicense(key: string): Promise<void>

  onGameTick(callback: (gameData: GameDataDto) => void): void
  onGameStarted(callback: (gameData: GameDataDto) => void): void
  onGameStopped(callback: (gameData: GameDataDto) => void): void
}
