import {
  BaronKilledEvent,
  DragonKilledEvent,
  GameEndedEvent,
  GameStartedEvent,
  GameTickEvent
} from '../events'

export type EventMap = {
  'game-started': GameStartedEvent
  'game-ended': GameEndedEvent
  'game-tick': GameTickEvent
  'dragon-killed': DragonKilledEvent
  'baron-killed': BaronKilledEvent
}

export type EventKey = keyof EventMap
export type EventCallback<T extends EventKey> = (event: EventMap[T]) => void

export interface IEventBus {
  publish<T extends EventKey>(eventType: T, event: EventMap[T]): void
  subscribe<T extends EventKey>(eventType: T, callback: EventCallback<T>): void
  unsubscribe<T extends EventKey>(eventType: T, callback: EventCallback<T>): void
}
