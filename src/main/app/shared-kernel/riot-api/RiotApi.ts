import { GameEvent, GameStartedEvent } from '../EventBus'
import { GameState } from '../game-detection'
import { Result } from '../Result'
import { IRiotClientDataSource, LiveGameData, RiotGameEvent } from './IRiotClientDataSource'

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
    return new GameState(
      rawGameState.gameData.gameTime,
      rawGameState.events.Events.map((evt) => this.transformEvent(evt, rawGameState)).filter(
        Boolean
      ) as GameEvent<unknown>[]
    )
  }

  private transformEvent(
    evt: RiotGameEvent,
    rawGameState: LiveGameData
  ): GameEvent<unknown> | null {
    switch (evt.EventName) {
      case 'GameStart':
        return new GameStartedEvent(evt.EventID, {
          // TODO: make sure we test this Floor
          gameTime: Math.floor(rawGameState.gameData.gameTime)
        })
      default:
        // TODO: handle other events
        console.warn(`Unknown event: ${evt.EventName}`)
        return null
    }
  }
}
