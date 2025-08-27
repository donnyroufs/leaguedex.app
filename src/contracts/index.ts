export type { IReminderDto } from '@hexagon/ReminderDto'
export type { CreateReminderDto } from '@hexagon/CreateReminderUseCase'

export type GameDataDto = {
  type: 'game-data'
  started: boolean
  time: number | null
}
