import { EventEmitter } from 'events'
import { ILogger } from './ILogger'

export type EventMap = {
  'game-started': GameStartedEvent
  'game-ended': GameEndedEvent
  'game-tick': GameTickEvent
}

export type EventKey = keyof EventMap
export type EventCallback<T extends EventKey> = (event: EventMap[T]) => void

export interface IEventBus {
  publish<T extends EventKey>(eventType: T, event: EventMap[T]): void
  subscribe<T extends EventKey>(eventType: T, callback: EventCallback<T>): void
  unsubscribe<T extends EventKey>(eventType: T, callback: EventCallback<T>): void
}

export abstract class GameEvent<TData> {
  public abstract readonly eventType: EventKey

  public constructor(
    public readonly id: number,
    public readonly data: TData
  ) {}
}

export class GameStartedEvent extends GameEvent<{ gameTime: number }> {
  public readonly eventType = 'game-started'
}

export class GameEndedEvent extends GameEvent<null> {
  public readonly eventType = 'game-ended'
}

export class GameTickEvent extends GameEvent<{ gameTime: number }> {
  public readonly eventType = 'game-tick'
}

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
}
