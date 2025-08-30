import { CuePack } from '@hexagon/CuePack'

import { Result } from '../../shared-kernel'

export interface ICuePackRepository {
  all(): Promise<Result<CuePack[], Error>>
  save(cuePack: CuePack): Promise<Result<void, Error>>
  load(id: string): Promise<Result<CuePack | null, Error>>

  /**
   * Gets the current active cue pack
   */
  active(): Promise<Result<CuePack | null, Error>>
}
