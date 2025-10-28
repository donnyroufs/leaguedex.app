import { GetGameStateResult, IGameDataProvider, GameData } from '../src/main/hexagon'
import { Result } from '../src/main/shared-kernel'

export class StubGameDataProvider implements IGameDataProvider {
  private _gameData: GameData | null = null
  private _tick: number = 0

  public async getGameData(): Promise<GetGameStateResult> {
    if (!this._gameData) {
      return Result.err(new Error('Game data not set'))
    }

    return Result.ok({
      ...this._gameData,
      gameTime: this._tick
    })
  }

  public setStopped(): void {
    this._gameData = null
  }

  public tick(): void {
    this._tick++
  }

  public setStarted(time: number = 0): void {
    this._tick = time
    this._gameData = {
      hasStarted: true,
      gameTime: this._tick,
      events: [],
      activePlayer: {
        summonerName: 'test#123',
        isAlive: true,
        respawnsIn: 0,
        currentMana: null,
        totalMana: null
      }
    }
  }
}
