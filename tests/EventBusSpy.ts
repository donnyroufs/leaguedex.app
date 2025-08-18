import { EventKey, EventMap, GameEvent, IEventBus } from '../src/main/app/shared-kernel/EventBus'

export class EventBusSpy implements IEventBus {
  public events: GameEvent<unknown>[] = []
  public lastEvent: GameEvent<unknown> | null = null
  public lastEventType: EventKey | null = null
  public totalCalls: number = 0

  public publish<T extends EventKey>(eventType: T, event: EventMap[T]): void {
    this.events.push(event)
    this.lastEvent = this.events[this.events.length - 1]
    this.totalCalls++
    this.lastEventType = eventType
  }

  public subscribe(): void {
    return
  }

  public unsubscribe(): void {
    return
  }
}
