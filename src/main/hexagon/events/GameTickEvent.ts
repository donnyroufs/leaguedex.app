import { GameEvent } from './GameEvent'

export class GameTickEvent extends GameEvent<{ gameTime: number }> {
  public readonly eventType = 'game-tick'
}
