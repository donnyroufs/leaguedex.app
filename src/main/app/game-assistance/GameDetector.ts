import { AllGameData, IRiotClient } from './IRiotClient'
import { Seconds } from './types'

export type GameDetected = {
  type: 'pre-game' | 'in-game' | 'none'
  time: Seconds | null
  data: AllGameData | null
}

export class GameDetector {
  public constructor(private readonly _riotClient: IRiotClient) {}

  /**
   * @returns the time in seconds since the game started or null if there is no game detected
   */
  public async detect(): Promise<GameDetected> {
    const response = await this._riotClient.getGameData()

    if (response === null) {
      return {
        type: 'none',
        time: null,
        data: null
      }
    }

    const gameTime = Math.floor(response.gameData.gameTime)

    if (gameTime > 0) {
      return {
        type: 'in-game',
        time: gameTime,
        data: response
      }
    }

    return {
      type: 'pre-game',
      time: gameTime,
      data: response
    }
  }
}
