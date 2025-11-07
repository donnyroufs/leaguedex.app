import {
  BaronKilledEvent,
  DragonKilledEvent,
  GameEvent,
  IGameDataProvider,
  Team,
  GetGameStateResult
} from '../../../hexagon'
import { IRiotClientDataSource, LiveGameData, RiotGameEvent } from './IRiotClientDataSource'
import { Result } from '../../../shared-kernel'

/**
 * Riot Client exposes an API on localhost
 */
export class RiotLiveClientApi implements IGameDataProvider {
  public constructor(private readonly _dataSource: IRiotClientDataSource) {}

  public async getGameData(): Promise<GetGameStateResult> {
    const result = await this._dataSource.getGameData()

    if (result.isErr()) {
      return Result.err(result.getError())
    }

    const value = result.getValue()

    // We can assume its not started
    if (value.events.Events.length === 0) {
      return Result.ok(null)
    }

    const activePlayer = value.activePlayer
    const player = value.allPlayers.find((p) => p.summonerName === activePlayer.summonerName)

    if (!player) {
      throw new Error('Active player not found')
    }

    const events = value.events.Events.map((evt) => this.transformEvent(evt, value)).filter(
      Boolean
    ) as GameEvent<unknown>[]

    return Result.ok({
      hasStarted: true,
      gameTime: Math.floor(value.gameData.gameTime),
      events,
      activePlayer: {
        summonerName: activePlayer.summonerName,
        isAlive: !player.isDead,
        respawnsIn: Math.round(player.respawnTimer) || null,
        currentMana:
          activePlayer.championStats.resourceType === 'MANA'
            ? activePlayer.championStats.resourceValue
            : null,
        totalMana:
          activePlayer.championStats.resourceType === 'MANA'
            ? activePlayer.championStats.resourceMax
            : null,
        currentGold: activePlayer.currentGold,
        items: player.items.map((item) => item.itemID)
      }
    })
  }

  // TODO: regression test that we pass the right gametime. It should be from the event not the state.
  // TODO: test against different teams (this makes sure we transform the data correctly)
  private transformEvent(evt: RiotGameEvent, data: LiveGameData): GameEvent<unknown> | null {
    const teams = data.allPlayers.map((x) => ({
      team: (x.team.toLowerCase() === 'chaos' ? 'red' : 'blue') as Team,
      summonerName: x.summonerName
    }))

    switch (evt.EventName) {
      case 'DragonKill':
        return new DragonKilledEvent(evt.EventID, {
          gameTime: Math.floor(evt.EventTime),
          killedByTeam: teams.find((x) => x.summonerName.includes(evt.KillerName!))!.team
        })
      case 'BaronKill':
        return new BaronKilledEvent(evt.EventID, {
          gameTime: Math.floor(evt.EventTime)
        })
      default:
        return null
    }
  }
}
