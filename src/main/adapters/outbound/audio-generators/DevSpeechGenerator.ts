import { Result } from '../../../shared-kernel'
import { ITextToSpeechGenerator } from '../../../hexagon'
import { join } from 'path'

export class DevSpeechGenerator implements ITextToSpeechGenerator {
  public async generate(text: string): Promise<Result<string, Error>> {
    const projectRoot = process.cwd()
    return Result.ok(join(projectRoot, this.createFileName(text)))
  }

  private createFileName(text: string): string {
    return text
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase()
  }
}
