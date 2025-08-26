import { GameEvent } from './game-events/GameEvent'
import { ActivePlayer } from './ActivePlayer'

/**
 * Active processed state of the game.
 * Generally speaking, RiotApi -> Mapping Process -> Assembler -> GameState
 */
export class GameState {
  public constructor(
    public readonly gameTime: number,
    public readonly events: GameEvent<unknown>[],
    public readonly activePlayer: ActivePlayer
  ) {}
}
