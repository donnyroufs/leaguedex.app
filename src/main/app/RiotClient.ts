import { AllGameData, GameEvent, IRiotClient, NormalizedGameEvent } from './IRiotClient'
import { type AxiosInstance } from 'axios'

export class RiotClient implements IRiotClient {
  public constructor(private readonly _axios: AxiosInstance) {}

  public async getGameEvents(): Promise<NormalizedGameEvent[]> {
    try {
      const response = await this._axios.get('https://127.0.0.1:2999/liveclientdata/eventdata')

      if (response.status !== 200) {
        return []
      }

      return response.data.Events.map((evt: GameEvent) => ({
        id: evt.EventID,
        name: evt.EventName,
        timeInSeconds: evt.EventTime
      }))
    } catch (err) {
      // TODO: We need to configure a logger
      console.error('failed to get game events', err)
    }

    return []
  }

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
