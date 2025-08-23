import { GameEvent } from './events/GameEvent'
import { Player } from './Player'

export class GameState {
  public constructor(
    public readonly gameTime: number,
    public readonly events: GameEvent<unknown>[],
    public readonly activePlayer: Player
  ) {}
}
