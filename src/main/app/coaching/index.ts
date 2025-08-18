import { Result } from '../shared-kernel'

export class CoachingModule {
  public async init(): Promise<Result<string, Error>> {
    return Result.ok('Coaching initialized')
  }

  public async dispose(): Promise<Result<string, Error>> {
    return Result.ok('Coaching disposed')
  }
}
