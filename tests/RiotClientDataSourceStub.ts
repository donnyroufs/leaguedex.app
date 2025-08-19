import { Result } from '../src/main/app/shared-kernel'
import {
  IRiotClientDataSource,
  SimulatedRiotClientDataSource,
  LiveGameData,
  GetGameDataResult
} from '../src/main/app/shared-kernel'

type WriteableDeep<T> = {
  -readonly [P in keyof T]: T[P] extends object ? WriteableDeep<T[P]> : T[P]
}

export class RiotClientDataSourceStub implements IRiotClientDataSource {
  private _response: WriteableDeep<LiveGameData> =
    SimulatedRiotClientDataSource.createSampleResponse()
  private _shouldError = false
  private _error: Error | null = null

  public async getGameData(): Promise<GetGameDataResult> {
    if (this._shouldError) {
      return Result.err(this._error ?? new Error('RiotClientDataSourceStub error'))
    }

    return Result.ok(this._response)
  }

  public setGameTime(gameTime: number): void {
    this._response.gameData.gameTime = gameTime
  }

  public setGameStarted(): void {
    this._response.events = {
      Events: [
        {
          EventID: 0,
          EventName: 'GameStart',
          EventTime: 0.0000000023
        }
      ]
    }
  }

  public shouldError(error?: Error): void {
    this._shouldError = true
    this._error = error ?? null
  }

  public shouldNotError(): void {
    this._shouldError = false
    this._error = null
  }
}
