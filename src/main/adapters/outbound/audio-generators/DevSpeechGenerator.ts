import { Result } from '../../../shared-kernel'
import { ITextToSpeechGenerator } from '../../../hexagon'
import { AudioFileName } from '../../../hexagon/AudioFileName'

export class DevSpeechGenerator implements ITextToSpeechGenerator {
  public async generate(text: string): Promise<Result<AudioFileName, Error>> {
    const projectRoot = process.cwd()
    return Result.ok(AudioFileName.createMP3(text, projectRoot))
  }
}
