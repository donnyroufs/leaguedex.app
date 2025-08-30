import { IUseCase } from '../shared-kernel/IUseCase'
import { ICuePackRepository } from './ports/ICuePackRepository'
import { ITextToSpeechGenerator } from './ports/ITextToSpeechGenerator'
import { CuePackEncoder } from './CuePackEncoder'
import { ILogger } from './ports/ILogger'

type ImportPackUseCaseInput = {
  code: string
}

type ImportPackUseCaseOutput = string

export class ImportPackUseCase
  implements IUseCase<ImportPackUseCaseInput, ImportPackUseCaseOutput>
{
  public constructor(
    private readonly _cuePackRepository: ICuePackRepository,
    private readonly _textToSpeechGenerator: ITextToSpeechGenerator,
    private readonly _logger: ILogger
  ) {}

  public async execute(input: ImportPackUseCaseInput): Promise<ImportPackUseCaseOutput> {
    try {
      const { code } = input
      const cuePack = await CuePackEncoder.decode(code, this._textToSpeechGenerator)
      const result = await this._cuePackRepository.save(cuePack)

      return result.throwOrReturn(cuePack.id)
    } catch (err) {
      this._logger.error('Failed to import cue pack', { error: err })
      throw err
    }
  }
}
