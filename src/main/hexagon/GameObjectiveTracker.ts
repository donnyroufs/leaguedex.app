import { BaronKilledEvent, DragonKilledEvent } from './events'
import { GameState } from './GameState'
import { ILogger } from './ports/ILogger'
import { ReminderObjective } from './Reminder'
import { Team } from './Team'

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

  // Use the existing Team type
  private _teamDragonKills: Record<Team, number> = {
    red: 0,
    blue: 0
  }

  public constructor(private readonly _logger?: ILogger) {}

  public getNextSpawn(objective: ReminderObjective): number | null {
    return this._objectiveState[objective].nextSpawn
  }

  public track(gameState: GameState): void {
    for (const evt of gameState.events) {
      if (this._processedEvents.has(evt.id)) {
        continue
      }

      switch (evt.eventType) {
        case 'dragon-killed': {
          const dragonEvent = evt as DragonKilledEvent
          const killedByTeam = dragonEvent.data.killedByTeam

          // Track team dragon kills using the Team type
          this._teamDragonKills[killedByTeam]++

          this._logger?.info(`Dragon killed by ${killedByTeam}`, {
            dragonKills: this._teamDragonKills
          })

          if (this._teamDragonKills.red >= 4 || this._teamDragonKills.blue >= 4) {
            this._objectiveState.dragon.nextSpawn = dragonEvent.data.gameTime + 360
          } else {
            this._objectiveState.dragon.nextSpawn = dragonEvent.data.gameTime + 300
          }

          this._objectiveState.dragon.isAlive = false
          break
        }
        case 'baron-killed':
          this._objectiveState.baron.nextSpawn = (evt as BaronKilledEvent).data.gameTime + 360
          this._objectiveState.baron.isAlive = false
          break
      }

      this._processedEvents.add(evt.id)
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
    return Object.freeze({ ...this._objectiveState })
  }

  public reset(): void {
    this._processedEvents.clear()
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

    this._teamDragonKills = {
      red: 0,
      blue: 0
    }
  }
}
