import { GameEvent } from './game-events'
import { GameData } from './GameData'
import { GameObjectiveTracker } from './GameObjectiveTracker'
import { GameState, ObjectiveState } from './GameState'
import { Team } from './Team'

export class GameStateAssembler {
  private _processedEvents = new Set<number>()

  public assemble(data: GameData): GameState {
    const events = this.getAndTrackUnprocessedEvents(data)
    const trackedObjectives = GameObjectiveTracker.track(data)
    const objectives = this.decorateObjectives(
      trackedObjectives,
      data.gameTime,
      data.activePlayer.team
    )

    const manaPercent =
      data.activePlayer.currentMana !== null &&
      data.activePlayer.totalMana !== null &&
      data.activePlayer.totalMana > 0
        ? (data.activePlayer.currentMana / data.activePlayer.totalMana) * 100
        : null

    const state = new GameState(
      data.gameTime,
      events,
      {
        summonerName: data.activePlayer.summonerName,
        isAlive: data.activePlayer.isAlive,
        respawnsIn: data.activePlayer.respawnsIn,
        currentMana: data.activePlayer.currentMana,
        totalMana: data.activePlayer.totalMana,
        manaPercent,
        currentGold: data.activePlayer.currentGold,
        items: data.activePlayer.items,
        team: data.activePlayer.team
      },
      objectives
    )

    return state
  }

  private decorateObjectives(
    objectives: ObjectiveState,
    gameTime: number,
    team: Team
  ): ObjectiveState {
    const secondsUntilSpawn = (isAlive: boolean, nextSpawn: number | null): number | null =>
      isAlive || nextSpawn === null ? null : Math.max(0, nextSpawn - gameTime)

    const enemyTeam: Team = team === 'blue' ? 'red' : 'blue'

    return {
      ...objectives,
      dragon: {
        ...objectives.dragon,
        secondsUntilSpawn: secondsUntilSpawn(objectives.dragon.isAlive, objectives.dragon.nextSpawn),
        myTeamKills: objectives.dragon.teamStats[team],
        enemyTeamKills: objectives.dragon.teamStats[enemyTeam]
      },
      baron: {
        ...objectives.baron,
        secondsUntilSpawn: secondsUntilSpawn(objectives.baron.isAlive, objectives.baron.nextSpawn)
      },
      grubs: {
        ...objectives.grubs,
        secondsUntilSpawn: secondsUntilSpawn(objectives.grubs.isAlive, objectives.grubs.nextSpawn)
      },
      herald: {
        ...objectives.herald,
        secondsUntilSpawn: secondsUntilSpawn(objectives.herald.isAlive, objectives.herald.nextSpawn)
      },
      atakhan: {
        ...objectives.atakhan,
        secondsUntilSpawn: secondsUntilSpawn(
          objectives.atakhan.isAlive,
          objectives.atakhan.nextSpawn
        )
      }
    }
  }

  private getAndTrackUnprocessedEvents(data: GameData): GameEvent<unknown>[] {
    const evts = data.events.filter((evt) => !this._processedEvents.has(evt.id))
    evts.forEach((evt) => this._processedEvents.add(evt.id))
    return evts
  }
}
