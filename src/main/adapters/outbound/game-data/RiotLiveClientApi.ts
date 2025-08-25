import {
  BaronKilledEvent,
  DragonKilledEvent,
  GameEvent,
  GameStartedEvent,
  IGameDataProvider,
  Player,
  Team
} from '../../../hexagon'
import { IRiotClientDataSource, LiveGameData, RiotGameEvent } from './IRiotClientDataSource'
import { Result } from '../../../shared-kernel'
import { GameState } from '../../../hexagon'
import { GetGameStateResult } from '../../../hexagon'

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

    return Result.ok(this.transformToDomain(result.getValue()))
  }

  private transformToDomain(rawGameState: LiveGameData): GameState {
    const activePlayer = rawGameState.activePlayer
    const player = rawGameState.allPlayers.find((p) => p.summonerName === activePlayer.summonerName)

    if (!player) {
      throw new Error('Active player not found')
    }

    const domainPlayer: Player = {
      summonerName: player.summonerName,
      isAlive: !player.isDead,
      // TODO: check if we should floor/round or even ceil this
      respawnsIn: Math.round(player.respawnTimer) || null
    }

    const events = rawGameState.events.Events.map((evt) =>
      this.transformEvent(evt, rawGameState)
    ).filter(Boolean)

    return new GameState(
      rawGameState.gameData.gameTime,
      events as GameEvent<unknown>[],
      domainPlayer
    )
  }

  // TODO: regression test that we pass the right gametime. It should be from the event not the state.
  // TODO: test against different teams (this makes sure we transform the data correctly)
  private transformEvent(evt: RiotGameEvent, data: LiveGameData): GameEvent<unknown> | null {
    const teams = data.allPlayers.map((x) => ({
      team: (x.team.toLowerCase() === 'chaos' ? 'red' : 'blue') as Team,
      summonerName: x.summonerName
    }))

    switch (evt.EventName) {
      // TODO: probably shouldnt be an event anymore
      case 'GameStart':
        return new GameStartedEvent(evt.EventID, {
          // TODO: check if we should floor/round or even ceil this
          gameTime: Math.round(evt.EventTime)
        })
      case 'DragonKill':
        return new DragonKilledEvent(evt.EventID, {
          gameTime: Math.round(evt.EventTime),
          killedByTeam: teams.find((x) => x.summonerName.includes(evt.KillerName!))!.team // TODO: Test against the includes. Apparently KillerName is never with #uniqueId
        })
      case 'BaronKill':
        return new BaronKilledEvent(evt.EventID, {
          gameTime: Math.round(evt.EventTime)
        })
      default:
        // TODO: handle other events
        console.warn(`Unknown event: ${evt.EventName}`)
        return null
    }
  }
}
