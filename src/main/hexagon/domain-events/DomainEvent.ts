import { EventKey } from '../ports/IEventBus'

export abstract class DomainEvent<TData = Record<string, unknown>> {
  public abstract readonly eventType: EventKey

  public constructor(
    public readonly payload: TData,
    public readonly id: string = crypto.randomUUID(),
    public readonly timestamp: number = Date.now()
  ) {}
}
