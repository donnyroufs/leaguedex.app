import { Result } from '../../shared-kernel'
import { GameData } from '../GameData'

export type OkResult = GameData | null
export type ErrResult = Error
export type GetGameStateResult = Result<OkResult, ErrResult>

export interface IGameDataProvider {
  getGameData(): Promise<GetGameStateResult>
}
