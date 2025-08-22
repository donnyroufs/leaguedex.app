import { IEventBus, EventKey, EventMap, GameEvent } from '../src/main/hexagon'

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

  public hasEvent(eventType: EventKey): boolean {
    return this.events.some((event) => event.eventType === eventType)
  }

  public hasAllEvents(eventTypes: EventKey[]): boolean {
    const events = this.events.filter((event) => eventTypes.includes(event.eventType))
    return events.length === eventTypes.length
  }

  public hasAllEventsInOrder(eventTypes: EventKey[]): boolean {
    for (let i = 0; i < eventTypes.length; i++) {
      if (this.events[i]?.eventType !== eventTypes[i]) {
        return false
      }
    }

    return true
  }

  public subscribe(): void {
    return
  }

  public unsubscribe(): void {
    return
  }
}
