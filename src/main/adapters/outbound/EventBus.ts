import { EventEmitter } from 'events'
import { ILogger, IEventBus, EventKey, EventMap, EventCallback } from '../../hexagon'

export class EventBus implements IEventBus {
  private readonly _emitter: EventEmitter

  public constructor(private readonly _logger: ILogger) {
    this._emitter = new EventEmitter()
  }

  public publish<T extends EventKey>(eventType: T, event: EventMap[T]): void {
    this._logger.debug(`Publishing event`, { event })
    this._emitter.emit(eventType, event)
  }

  public subscribe<T extends EventKey>(eventType: T, callback: EventCallback<T>): void {
    this._emitter.on(eventType, callback)
  }

  public unsubscribe<T extends EventKey>(eventType: T, callback: EventCallback<T>): void {
    this._emitter.off(eventType, callback)
  }

  public clear(): void {
    this._emitter.removeAllListeners()
  }
}
