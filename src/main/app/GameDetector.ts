import { IRiotClient } from './IRiotClient'

type Seconds = number

export class GameDetector {
  public constructor(private readonly _riotClient: IRiotClient) {}

  /**
   * @returns the time in seconds since the game started or null if there is no game detected
   */
  public async detect(): Promise<Seconds | null> {
    const response = await this._riotClient.getGameData()

    if (response?.gameData == null) {
      return null
    }

    return response.gameData.gameTime
  }
}
