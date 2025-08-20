import { GameEvent } from './GameEvent'

export class GameStartedEvent extends GameEvent<{ gameTime: number }> {
  public readonly eventType = 'game-started'
}
