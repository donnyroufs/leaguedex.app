import EventEmitter from 'events'
import { IDispatcher, Contract } from './IDispatcher'

export class Dispatcher implements IDispatcher {
  private readonly _emitter: EventEmitter

  public constructor(emitter: EventEmitter) {
    this._emitter = emitter
  }

  subscribe<TName extends keyof Contract>(
    name: TName,
    callback: (data: Contract[TName]) => void
  ): void {
    this._emitter.on(name, callback)
  }

  dispatch<TName extends keyof Contract>(name: TName, data: Contract[TName]): void {
    this._emitter.emit(name, data)
  }
}
