export type { ICueDto } from '@hexagon/ICueDto'
export type { CreateCueDto } from '@hexagon/AddCueToPackUseCase'
export type { CreateCuePackDto } from '@hexagon/CreateCuePackUseCase'
export type { ICuePackDto } from '@hexagon/GetCuePacksUseCase'


export type GameDataDto = {
  type: 'game-data'
  started: boolean
  time: number | null
}
