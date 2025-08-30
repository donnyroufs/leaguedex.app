import { EventKey } from '../ports/IEventBus'
import { DomainEvent } from './DomainEvent'

export class CuePackRemovedEvent extends DomainEvent<{ id: string }> {
  public readonly eventType: EventKey = 'cue-pack-removed'

  public constructor(public readonly id: string) {
    super({ id })
  }
}
