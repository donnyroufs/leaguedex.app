import { Result } from '../../shared-kernel'

export interface ITextToSpeechGenerator {
  generate(text: string): Promise<Result<string, Error>>
}
