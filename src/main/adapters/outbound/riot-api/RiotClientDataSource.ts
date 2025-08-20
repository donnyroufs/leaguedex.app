import axios from 'axios'
import https from 'https'

import { Result } from '../../../shared-kernel'
import { GetGameDataResult, IRiotClientDataSource, LiveGameData } from './IRiotClientDataSource'

export class RiotClientDataSource implements IRiotClientDataSource {
  private _axios = axios.create({
    baseURL: 'https://127.0.0.1:2999',
    httpsAgent: new https.Agent({
      rejectUnauthorized: false
    })
  })

  public async getGameData(): Promise<GetGameDataResult> {
    try {
      const response = await this._axios.get<LiveGameData>('/liveclientdata/allgamedata')

      if (response.status !== 200) {
        return Result.err(new Error('Failed to get game data'))
      }

      if (!('gameData' in response.data)) {
        return Result.err(new Error('Game not started 404'))
      }

      return Result.ok({
        ...response.data,
        gameData: {
          ...response.data.gameData,
          gameTime: Math.floor(response.data.gameData.gameTime)
        }
      })
    } catch (err) {
      return Result.err(err as Error)
    }
  }
}
