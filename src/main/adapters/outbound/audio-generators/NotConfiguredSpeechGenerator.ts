import { ITextToSpeechGenerator } from '../../../hexagon'
import { AudioFileName } from '@hexagon/AudioFileName'
import { Result } from '../../../shared-kernel'

export class NotConfiguredSpeechGenerator implements ITextToSpeechGenerator {
  public async generate(): Promise<Result<AudioFileName, Error>> {
    return Result.err(
      new Error('Speech engine is not configured. Please complete setup in Settings.')
    )
  }
}
