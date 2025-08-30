import { EventMap } from '@hexagon/ports/IEventBus'
import { DomainEvent } from './DomainEvent'

export class CuePackImportedEvent extends DomainEvent<{ id: string }> {
  public eventType: keyof EventMap = 'cue-pack-imported'

  public constructor(public readonly cuePackId: string) {
    super({ id: cuePackId })
  }
}
