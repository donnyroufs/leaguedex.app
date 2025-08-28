import { Result } from '../../../shared-kernel'
import { ICueRepository, Cue } from '../../../hexagon'

export class FakeCueRepository implements ICueRepository {
  private readonly _cues: Map<string, Cue> = new Map()

  public async save(cue: Cue): Promise<Result<void, Error>> {
    try {
      this._cues.set(cue.id, cue)
      return Result.ok(undefined)
    } catch (error) {
      return Result.err(error as Error)
    }
  }

  public async all(): Promise<Result<Cue[], Error>> {
    return Result.ok(Array.from(this._cues.values()))
  }

  public async remove(id: string): Promise<Result<void, Error>> {
    this._cues.delete(id)
    return Result.ok(undefined)
  }

  public clear(): void {
    this._cues.clear()
  }
}
