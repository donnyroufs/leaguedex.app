import { GameEvent } from '../EventBus'

export class GameState {
  public constructor(
    public readonly gameTime: number,
    public readonly events: GameEvent<unknown>[]
  ) {}
}
