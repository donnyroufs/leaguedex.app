import { GameEvent } from './GameEvent'

export class GameEndedEvent extends GameEvent<null> {
  public readonly eventType = 'game-ended'
}
