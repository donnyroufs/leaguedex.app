import { EventMap } from '../ports/IEventBus'
import { DomainEvent } from './DomainEvent'

export class CuePackCreatedEvent extends DomainEvent<{ id: string }> {
  public readonly eventType: keyof EventMap = 'cue-pack-created'
}
