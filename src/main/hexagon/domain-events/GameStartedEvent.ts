import { EventMap } from '../ports/IEventBus'
import { DomainEvent } from './DomainEvent'

export class GameStartedEvent extends DomainEvent<{ gameTime: number }> {
  public readonly eventType: keyof EventMap = 'game-started'
}
