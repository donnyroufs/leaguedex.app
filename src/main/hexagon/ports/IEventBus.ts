import {
  CuePackCreatedEvent,
  CuePackImportedEvent,
  CuePackRemovedEvent,
  GameStartedEvent,
  GameStoppedEvent,
  GameTickEvent
} from '../domain-events'

export type EventMap = {
  'game-started': GameStartedEvent
  'game-stopped': GameStoppedEvent
  'game-tick': GameTickEvent
  'cue-pack-created': CuePackCreatedEvent
  'cue-pack-removed': CuePackRemovedEvent
  'cue-pack-imported': CuePackImportedEvent
}

export type EventKey = keyof EventMap
export type EventCallback<T extends EventKey> = (event: EventMap[T]) => void

export interface IEventBus {
  publish<T extends EventKey>(eventType: T, event: EventMap[T]): void
  // publish<T extends EventKey>(event: EventMap[T]): void
  subscribe<T extends EventKey>(eventType: T, callback: EventCallback<T>): void
  unsubscribe<T extends EventKey>(eventType: T, callback: EventCallback<T>): void
}
