import { Result } from '../../../shared-kernel'
import { ITextToSpeechGenerator } from '../../../hexagon'
import { join } from 'path'

export class DevSpeechGenerator implements ITextToSpeechGenerator {
  public async generate(): Promise<Result<string, Error>> {
    const projectRoot = process.cwd()
    return Result.ok(join(projectRoot, 'dev-stub.wav'))
  }
}
