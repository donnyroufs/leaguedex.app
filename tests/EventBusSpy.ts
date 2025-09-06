import { IEventBus, EventKey, EventMap, DomainEvent } from '../src/main/hexagon'

export class EventBusSpy implements IEventBus {
  public events: DomainEvent[] = []
  public lastEvent: DomainEvent | null = null
  public lastEventType: EventKey | null = null
  public totalCalls: number = 0
  public subscribers: EventKey[] = []

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

  public getEventTypes(): EventKey[] {
    return this.events.map((event) => event.eventType)
  }

  public hasAllEventsInOrder(eventTypes: EventKey[]): boolean {
    for (let i = 0; i < eventTypes.length; i++) {
      if (this.events[i]?.eventType !== eventTypes[i]) {
        return false
      }
    }

    return true
  }

  public hasEventOnce(eventType: EventKey): boolean {
    return this.events.filter((event) => event.eventType === eventType).length === 1
  }

  public subscribe(eventType: EventKey): void {
    this.subscribers.push(eventType)
    return
  }

  public unsubscribe(): void {
    return
  }

  public clear(): void {
    this.events = []
    this.lastEvent = null
    this.lastEventType = null
    this.totalCalls = 0
    this.subscribers = []
  }
}
