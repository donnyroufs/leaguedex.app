import { ICuePackRepository } from '@hexagon/ports/ICuePackRepository'
import { CuePack } from '@hexagon/CuePack'

import { Result } from '../../../shared-kernel'

export class FakeCuePackRepository implements ICuePackRepository {
  private readonly _cuePacks: Map<string, CuePack> = new Map()

  public async all(): Promise<Result<CuePack[], Error>> {
    return Result.ok(Array.from(this._cuePacks.values()))
  }

  public async save(cuePack: CuePack): Promise<Result<void, Error>> {
    this._cuePacks.set(cuePack.id, cuePack)
    return Result.ok()
  }

  public async active(): Promise<Result<CuePack | null, Error>> {
    const arr = Array.from(this._cuePacks.values())

    const activePack = arr.find((cuePack) => cuePack.isActive)

    if (!activePack) {
      return Result.ok(null)
    }

    return Result.ok(activePack)
  }

  public async load(id: string): Promise<Result<CuePack | null, Error>> {
    const cuePack = this._cuePacks.get(id)

    if (!cuePack) {
      return Result.ok(null)
    }

    return Result.ok(cuePack)
  }

  public async removeCue(cueId: string): Promise<Result<void, Error>> {
    const cuePack = await this.active()

    if (cuePack.isErr() || cuePack.unwrap() === null) {
      return Result.err(new Error('Cue pack not found'))
    }

    const pack = cuePack.unwrap()!

    pack.remove(cueId)

    await this.save(pack)

    return Result.ok()
  }

  public async remove(): Promise<Result<void, Error>> {
    throw new Error('Not implemented')
  }

  public clear(): void {
    this._cuePacks.clear()
  }
}
