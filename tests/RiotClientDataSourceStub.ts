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
  private _response: WriteableDeep<LiveGameData> | Error | null = null

  public async getGameData(): Promise<GetGameDataResult> {
    if (this._response instanceof Error) {
      return Result.err(this._response)
    }

    if (this._response == null) {
      return Result.err(new Error('Game not started'))
    }

    return Result.ok(this._response)
  }

  public setGameTime(gameTime: number): void {
    if (this._response instanceof Error) {
      throw this._response
    }

    this._response!.gameData.gameTime = gameTime
  }

  public setGameStarted(gameTime: number = 0): void {
    this._response = SimulatedRiotClientDataSource.createSampleResponse(gameTime)
  }

  public simulateError(): void {
    this._response = new Error('Game ended')
  }

  public simulateNull(): void {
    this._response = null
  }
}
