import { GameEvent, GameStartedEvent, Player } from '../../../hexagon'
import { IRiotClientDataSource, LiveGameData, RiotGameEvent } from './IRiotClientDataSource'
import { Result } from '../../../shared-kernel'
import { GameState } from '../../../hexagon'
import { GetGameStateResult } from '../../../hexagon'

export class RiotApi {
  public constructor(private readonly _dataSource: IRiotClientDataSource) {}

  public async getGameState(): Promise<GetGameStateResult> {
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
      // TODO: do we need to floor this?
      respawnsIn: Math.floor(player.respawnTimer) || null
    }

    const events = rawGameState.events.Events.map((evt) =>
      this.transformEvent(evt, rawGameState)
    ).filter(Boolean) as GameEvent<unknown>[]

    return new GameState(
      rawGameState.gameData.gameTime,
      events as GameEvent<unknown>[],
      domainPlayer
    )
  }

  private transformEvent(
    evt: RiotGameEvent,
    rawGameState: LiveGameData
  ): GameEvent<unknown> | null {
    switch (evt.EventName) {
      case 'GameStart':
        return new GameStartedEvent(evt.EventID, {
          // TODO: make sure we test this Floor
          gameTime: Math.floor(rawGameState.gameData.gameTime)
        })
      default:
        // TODO: handle other events
        console.warn(`Unknown event: ${evt.EventName}`)
        return null
    }
  }
}
