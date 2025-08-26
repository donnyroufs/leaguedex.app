import { GetGameStateResult, IGameDataProvider, GameData } from '../src/main/hexagon'
import { Result } from '../src/main/shared-kernel'

export class StubGameDataProvider implements IGameDataProvider {
  private _gameData: GameData | null = null

  public async getGameData(): Promise<GetGameStateResult> {
    if (!this._gameData) {
      return Result.err(new Error('Game data not set'))
    }

    return Result.ok(this._gameData)
  }

  public setStopped(): void {
    this._gameData = null
  }

  public setStarted(time: number = 0): void {
    this._gameData = {
      hasStarted: true,
      gameTime: time,
      events: [],
      activePlayer: {
        summonerName: 'test#123',
        isAlive: true,
        respawnsIn: 0
      }
    }
  }
}
