import { BaronKilledEvent, DragonKilledEvent } from './events'
import { GameState } from './GameState'
import { ReminderObjective } from './Reminder'

type ObjectiveData = {
  /**
   * Is the objective currently alive?
   */
  isAlive: boolean
  /**
   * When the objective will spawn next.
   */
  nextSpawn: number | null
  /**
   * How many deaths we have tracked for this objective.
   */
  totalDeaths: number
}

export type ObjectiveState = Record<ReminderObjective, ObjectiveData>

export class GameObjectiveTracker {
  private _objectiveState: ObjectiveState = {
    dragon: {
      isAlive: false,
      nextSpawn: 300,
      totalDeaths: 0
    },
    baron: {
      isAlive: false,
      nextSpawn: 1500,
      totalDeaths: 0
    }
  }
  private readonly _processedEvents = new Set<number>()

  public getNextSpawn(objective: ReminderObjective): number | null {
    return this._objectiveState[objective].nextSpawn
  }

  public track(gameState: GameState): void {
    for (const evt of gameState.events) {
      if (this._processedEvents.has(evt.id)) {
        continue
      }

      switch (evt.eventType) {
        case 'dragon-killed':
          this._objectiveState.dragon.nextSpawn = (evt as DragonKilledEvent).data.gameTime + 300
          this._objectiveState.dragon.totalDeaths++
          this._objectiveState.dragon.isAlive = false
          break
        case 'baron-killed':
          this._objectiveState.baron.nextSpawn = (evt as BaronKilledEvent).data.gameTime + 360
          this._objectiveState.baron.totalDeaths++
          this._objectiveState.baron.isAlive = false
          break
      }
    }

    if (!this._objectiveState.dragon.isAlive && gameState.gameTime === 300) {
      this._objectiveState.dragon.isAlive = true
      this._objectiveState.dragon.nextSpawn = null
    } else if (
      !this._objectiveState.dragon.isAlive &&
      this._objectiveState.dragon.nextSpawn !== null &&
      gameState.gameTime >= this._objectiveState.dragon.nextSpawn
    ) {
      this._objectiveState.dragon.isAlive = true
      this._objectiveState.dragon.nextSpawn = null
    }

    if (!this._objectiveState.baron.isAlive && gameState.gameTime === 1500) {
      this._objectiveState.baron.isAlive = true
      this._objectiveState.baron.nextSpawn = null
    } else if (
      !this._objectiveState.baron.isAlive &&
      this._objectiveState.baron.nextSpawn !== null &&
      gameState.gameTime >= this._objectiveState.baron.nextSpawn
    ) {
      this._objectiveState.baron.isAlive = true
      this._objectiveState.baron.nextSpawn = null
    }
  }

  public getState(): Readonly<ObjectiveState> {
    return Object.freeze(this._objectiveState)
  }
}

/**
 *  dragon: {
    name: 'Dragon',
    respawnTimer: 300, // 5 minutes
    firstSpawnTime: 300, // 5 minutes
    doesRespawn: true
  },
  baron: {
    name: 'Baron',
    respawnTimer: 360, // 6 minutes
    firstSpawnTime: 1500, // 25 minutes
    doesRespawn: true
  },
  herald: {
    name: 'Herald',
    respawnTimer: null,
    firstSpawnTime: 900, // 15 minutes
    doesRespawn: false
  },
  voidGrubs: {
    name: 'Void Grubs',
    respawnTimer: null,
    firstSpawnTime: 480, // 8 minutes
    doesRespawn: false
  },
  atakhan: {
    name: 'Atakhan',
    respawnTimer: null,
    firstSpawnTime: 1200, // 20 minutes
    doesRespawn: false
  }
 */
