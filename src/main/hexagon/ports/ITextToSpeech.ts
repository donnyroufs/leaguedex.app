import { Result } from '../../shared-kernel'

export interface ITextToSpeech {
  /**
   * Generates audio file and stores it in the audio directory
   */
  generate(text: string): Promise<Result<string, Error>>
}
