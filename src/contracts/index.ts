export type { ICueDto } from '@hexagon/ICueDto'
export type { CreateCueDto } from '@hexagon/CreateCueUseCase'

export type GameDataDto = {
  type: 'game-data'
  started: boolean
  time: number | null
}
