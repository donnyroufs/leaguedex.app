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
   * When the objective will spawn next.
   */
  nextSpawn: number | null
}

export type ObjectiveState = {
  dragon: ObjectiveData & {
    teamStats: Record<Team, number>
  }
  baron: ObjectiveData
  grubs: ObjectiveData
  herald: ObjectiveData
  atakhan: ObjectiveData
}

