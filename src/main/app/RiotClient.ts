import { AllGameData, IRiotClient } from './IRiotClient'
import { type AxiosInstance } from 'axios'

export class RiotClient implements IRiotClient {
  public constructor(private readonly _axios: AxiosInstance) {}

  public async getGameData(): Promise<AllGameData | null> {
    try {
      const response = await this._axios.get('https://127.0.0.1:2999/liveclientdata/allgamedata')

      if (response.status !== 200) {
        return null
      }

      return response.data
    } catch (err) {
      // TODO: We need to configure a logger
      console.error('failed to get game data', err)
      return null
    }
  }
}
