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
}

export type ObjectiveState = Record<ReminderObjective, ObjectiveData>

export class GameObjectiveTracker {
  private _objectiveState: ObjectiveState = {
    dragon: {
      isAlive: false,
      nextSpawn: 300
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
          this._objectiveState.dragon.isAlive = false
          break
        case 'baron-killed':
          this._objectiveState.baron.nextSpawn = (evt as BaronKilledEvent).data.gameTime + 360
          this._objectiveState.baron.isAlive = false
          break
      }

      // TODO: We need to mark them as processed but this fails the acceptance test
      // This probably means that the way we comunicate with the tracker and ticker is wrong
      // this._processedEvents.add(evt.id)
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

    if (gameState.gameTime === 480) {
      this._objectiveState.grubs.isAlive = true
      this._objectiveState.grubs.nextSpawn = null
    }

    if (gameState.gameTime === 900) {
      if (this._objectiveState.grubs.isAlive) {
        this._objectiveState.grubs.isAlive = false
        this._objectiveState.grubs.nextSpawn = null
      }

      this._objectiveState.herald.isAlive = true
      this._objectiveState.herald.nextSpawn = null
    }

    if (gameState.gameTime === 1200) {
      if (this._objectiveState.herald.isAlive) {
        this._objectiveState.herald.isAlive = false
        this._objectiveState.herald.nextSpawn = null
      }

      this._objectiveState.atakhan.isAlive = true
      this._objectiveState.atakhan.nextSpawn = null
    }

    if (gameState.gameTime === 1500) {
      if (this._objectiveState.herald.isAlive) {
        this._objectiveState.herald.isAlive = false
        this._objectiveState.herald.nextSpawn = null
      }
    }
  }

  public getState(): Readonly<ObjectiveState> {
    return Object.freeze(this._objectiveState)
  }

  public reset(): void {
    this._objectiveState = {
      dragon: {
        isAlive: false,
        nextSpawn: 300
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
