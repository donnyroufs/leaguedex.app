import { IRiotClientDataSource } from './IRiotClientDataSource'
import { RiotClientDataSource } from './RiotClientDataSource'
import { SimulatedRiotClientDataSource } from './SimulatedRiotClientDataSource'

export class DataSourceFactory {
  public static async create(isProd: boolean): Promise<IRiotClientDataSource> {
    if (isProd) {
      return new RiotClientDataSource()
    }

    return SimulatedRiotClientDataSource.createAndStartGame(600, 0, true)
  }
}
