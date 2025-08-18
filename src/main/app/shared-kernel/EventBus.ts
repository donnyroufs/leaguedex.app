import { EventEmitter } from 'events'
import { GameState } from './game-detection/GameState'

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

export class GameEvent<TData> {
  public readonly id: string = crypto.randomUUID()

  public constructor(
    public readonly gameTick: number,
    public readonly data: TData
  ) {}
}

export class GameStartedEvent extends GameEvent<GameState> {
  public readonly eventType = 'game-started'
}

export class GameEndedEvent extends GameEvent<null> {
  public readonly eventType = 'game-ended'
}

export class GameTickEvent extends GameEvent<GameState> {
  public readonly eventType = 'game-tick'
}

export class EventBus implements IEventBus {
  private readonly _emitter: EventEmitter

  public constructor() {
    this._emitter = new EventEmitter()
  }

  public publish<T extends EventKey>(eventType: T, event: EventMap[T]): void {
    this._emitter.emit(eventType, event)
  }

  public subscribe<T extends EventKey>(eventType: T, callback: EventCallback<T>): void {
    this._emitter.on(eventType, callback)
  }

  public unsubscribe<T extends EventKey>(eventType: T, callback: EventCallback<T>): void {
    this._emitter.off(eventType, callback)
  }
}
