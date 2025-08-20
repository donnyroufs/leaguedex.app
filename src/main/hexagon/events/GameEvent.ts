import { EventKey } from '../ports/IEventBus'

export abstract class GameEvent<TData> {
  public abstract readonly eventType: EventKey

  public constructor(
    public readonly id: number,
    public readonly data: TData
  ) {}
}
