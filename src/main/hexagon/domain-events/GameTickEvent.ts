import { GameState } from '../GameState'
import { EventMap } from '../ports/IEventBus'
import { DomainEvent } from './DomainEvent'

export class GameTickEvent extends DomainEvent<{ state: GameState }> {
  public readonly eventType: keyof EventMap = 'game-tick'
}
