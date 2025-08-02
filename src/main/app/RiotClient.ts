import { AllGameData, IRiotClient } from './IRiotClient'
import { type AxiosInstance } from 'axios'

export class RiotClient implements IRiotClient {
  public constructor(private readonly _axios: AxiosInstance) {}

  public async getGameData(): Promise<AllGameData> {
    const response = await this._axios.get('https://127.0.0.1:2999/liveclientdata/allgamedata')
    return response.data
  }
}
