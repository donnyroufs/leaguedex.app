import crypto from 'crypto'

import { Cue } from './Cue'

export class CuePack {
  public get cues(): ReadonlyArray<Cue> {
    return this._cues
  }

  public get isActive(): boolean {
    return this._isActive
  }

  private constructor(
    public readonly id: string,
    public readonly name: string,
    private _isActive: boolean,
    private readonly _cues: Cue[] = []
  ) {}

  public add(cue: Cue): void {
    this._cues.push(cue)
  }

  public deactivate(): void {
    this._isActive = false
  }

  public activate(): void {
    this._isActive = true
  }

  public static create(name: string): CuePack {
    return new CuePack(crypto.randomUUID(), name, false)
  }
}
