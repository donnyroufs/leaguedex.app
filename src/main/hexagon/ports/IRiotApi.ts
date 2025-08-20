import { Result } from '../../shared-kernel'
import { GameState } from '../GameState'

export type OkResult = GameState
export type ErrResult = Error
export type GetGameStateResult = Result<OkResult, ErrResult>

export interface IRiotApi {
  getGameState(): Promise<GetGameStateResult>
}
