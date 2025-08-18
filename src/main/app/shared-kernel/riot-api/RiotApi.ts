import { GameState } from '../game-detection'
import { Result } from '../Result'
import { IRiotClientDataSource, LiveGameData } from './IRiotClientDataSource'

type OkResult = GameState
type ErrResult = Error

export type GetGameStateResult = Result<OkResult, ErrResult>

export class RiotApi {
  public constructor(private readonly _dataSource: IRiotClientDataSource) {}

  public async getGameState(): Promise<GetGameStateResult> {
    const result = await this._dataSource.getGameData()

    if (result.isErr()) {
      return Result.err(result.getError())
    }

    return Result.ok(this.transformToDomain(result.getValue()))
  }

  private transformToDomain(rawGameState: LiveGameData): GameState {
    return new GameState(rawGameState.gameData.gameTime)
  }
}
