import { GameEvent } from './game-events/GameEvent'
import { ActivePlayer } from './ActivePlayer'
import { Team } from './Team'

/**
 * Active processed state of the game.
 * Generally speaking, RiotApi -> Mapping Process -> Assembler -> GameState
 */
export class GameState {
  public constructor(
    public readonly gameTime: number,
    public readonly events: GameEvent<unknown>[],
    public readonly activePlayer: ActivePlayer,
    public readonly objectives: ObjectiveState
  ) {}
}

type ObjectiveData = {
  /**
   * Is the objective currently alive?
   */
  isAlive: boolean
  /**
   * Absolute game time when the objective will spawn next.
   */
  nextSpawn: number | null
  /**
   * Seconds until the next spawn. Derived: nextSpawn - gameTime. Null when the objective is alive.
   */
  secondsUntilSpawn: number | null
}

export type ObjectiveState = {
  dragon: ObjectiveData & {
    teamStats: Record<Team, number>
    /**
     * Derived: how many dragons the active player's team has killed.
     */
    myTeamKills: number
    /**
     * Derived: how many dragons the enemy team has killed.
     */
    enemyTeamKills: number
  }
  baron: ObjectiveData
  grubs: ObjectiveData
  herald: ObjectiveData
  atakhan: ObjectiveData
}
