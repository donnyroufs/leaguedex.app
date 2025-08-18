import { Result } from '../shared-kernel'

export class CoachingModule {
  public async activate(): Promise<Result<string, Error>> {
    return Result.ok('Coaching activated')
  }

  public async deactivate(): Promise<Result<string, Error>> {
    return Result.ok('Coaching deactivated')
  }
}
