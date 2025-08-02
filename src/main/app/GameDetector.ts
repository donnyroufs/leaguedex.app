import { IRiotClient } from './IRiotClient'

export class GameDetector {
  public constructor(private readonly _riotClient: IRiotClient) {}

  /**
   * @returns the timestamp when the game started or null if there is no game detected
   */
  public async detect(): Promise<number | null> {
    const response = await this._riotClient.getGameData()

    if (response?.gameData == null) {
      return null
    }

    return response.gameData.gameTime
  }
}
