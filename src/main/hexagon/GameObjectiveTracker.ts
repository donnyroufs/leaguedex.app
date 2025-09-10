import { BaronKilledEvent, DragonKilledEvent } from './game-events'
import { GameData } from './GameData'
import { ObjectiveState } from './GameState'
import { Team } from './Team'

export class GameObjectiveTracker {
  public static track(gameData: GameData): ObjectiveState {
    const state = this.createObjectiveState()

    for (const evt of gameData.events) {
      switch (evt.constructor.name) {
        case DragonKilledEvent.name: {
          const dragonEvent = evt as DragonKilledEvent
          const killedByTeam = dragonEvent.data.killedByTeam

          this.incrementTeamDragonKills(state, killedByTeam)

          if (this.anyTeamHasFourDragonKills(state)) {
            state.dragon.nextSpawn = dragonEvent.data.gameTime + 360
          } else {
            state.dragon.nextSpawn = dragonEvent.data.gameTime + 300
          }

          state.dragon.isAlive = false
          break
        }
        case BaronKilledEvent.name: {
          state.baron.nextSpawn = (evt as BaronKilledEvent).data.gameTime + 360
          state.baron.isAlive = false
          break
        }
      }
    }

    if (!state.dragon.isAlive && gameData.gameTime === 300) {
      state.dragon.isAlive = true
      state.dragon.nextSpawn = null
    } else if (
      !state.dragon.isAlive &&
      state.dragon.nextSpawn !== null &&
      gameData.gameTime >= state.dragon.nextSpawn
    ) {
      state.dragon.isAlive = true
      state.dragon.nextSpawn = null
    }

    if (!state.baron.isAlive && gameData.gameTime === 1500) {
      state.baron.isAlive = true
      state.baron.nextSpawn = null
    } else if (
      !state.baron.isAlive &&
      state.baron.nextSpawn !== null &&
      gameData.gameTime >= state.baron.nextSpawn
    ) {
      state.baron.isAlive = true
      state.baron.nextSpawn = null
    }

    if (gameData.gameTime === 480) {
      state.grubs.isAlive = true
      state.grubs.nextSpawn = null
    }

    if (gameData.gameTime === 900) {
      state.grubs.isAlive = false
      state.grubs.nextSpawn = null

      state.herald.isAlive = true
      state.herald.nextSpawn = null
    }

    if (gameData.gameTime === 1200) {
      state.atakhan.isAlive = true
      state.atakhan.nextSpawn = null
    }

    if (gameData.gameTime === 1500) {
      state.herald.isAlive = false
      state.herald.nextSpawn = null

      state.baron.isAlive = true
      state.baron.nextSpawn = null
    }

    return state
  }

  private static anyTeamHasFourDragonKills(state: ObjectiveState): boolean {
    return state.dragon.teamStats.red >= 4 || state.dragon.teamStats.blue >= 4
  }

  private static incrementTeamDragonKills(state: ObjectiveState, killedByTeam: Team): void {
    state.dragon.teamStats[killedByTeam]++
  }

  private static createObjectiveState(): ObjectiveState {
    return {
      dragon: {
        isAlive: false,
        nextSpawn: 300,
        teamStats: {
          red: 0,
          blue: 0
        }
      },
      baron: {
        isAlive: false,
        nextSpawn: 1500
      },
      grubs: {
        isAlive: false,
        nextSpawn: 480
      },
      herald: {
        isAlive: false,
        nextSpawn: 900
      },
      atakhan: {
        isAlive: false,
        nextSpawn: 1200
      }
    }
  }
}
