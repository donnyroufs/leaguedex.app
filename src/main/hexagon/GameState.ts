import { GameEvent } from './events/GameEvent'

export class GameState {
  public constructor(
    public readonly gameTime: number,
    public readonly events: GameEvent<unknown>[]
  ) {}
}
