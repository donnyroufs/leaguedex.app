import { Result } from '../../shared-kernel'

import { GameEvent } from '../events'
import { Player } from '../Player'

export type OkResult = RawGameData
export type ErrResult = Error
export type GetGameStateResult = Result<OkResult, ErrResult>

export interface IGameDataProvider {
  getGameData(): Promise<GetGameStateResult>
}

type RawGameData = {
  readonly gameTime: number
  readonly events: GameEvent<unknown>[]
  readonly activePlayer: Player
}
