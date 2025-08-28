import { Result } from '../../shared-kernel'
import { Cue } from '../Cue'

export interface ICueRepository {
  save(cue: Cue): Promise<Result<void, Error>>
  all(): Promise<Result<Cue[], Error>>
  remove(id: string): Promise<Result<void, Error>>
}
