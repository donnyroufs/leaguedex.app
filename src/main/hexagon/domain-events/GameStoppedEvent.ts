import { EventMap } from '../ports/IEventBus'
import { DomainEvent } from './DomainEvent'

export class GameStoppedEvent extends DomainEvent {
  public readonly eventType: keyof EventMap = 'game-stopped'
}
