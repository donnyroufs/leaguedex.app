import { GameState } from '../GameState'
import { GameEvent } from './GameEvent'

export class GameTickEvent extends GameEvent<{ state: GameState }> {
  public readonly eventType = 'game-tick'
}
