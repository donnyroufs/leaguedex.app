import { AudioFileName } from '@hexagon/AudioFileName'
import { Result } from '../../shared-kernel'

export interface ITextToSpeechGenerator {
  generate(text: string): Promise<Result<AudioFileName, Error>>
}
