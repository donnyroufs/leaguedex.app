import { IUseCase } from '../shared-kernel/IUseCase'
import { ICuePackRepository } from './ports/ICuePackRepository'
import { ITextToSpeechGenerator } from './ports/ITextToSpeechGenerator'
import { IAudioRegenerationProgressReporter } from './ports/IAudioRegenerationProgressReporter'
import { ILogger } from './ports/ILogger'
import { IFileSystem } from './ports/IFileSystem'
import { AudioFileName } from './AudioFileName'

export class RegenerateAudioUseCase implements IUseCase<void, void> {
  public constructor(
    private readonly _cuePackRepository: ICuePackRepository,
    private readonly _textToSpeechGenerator: ITextToSpeechGenerator,
    private readonly _progressReporter: IAudioRegenerationProgressReporter,
    private readonly _logger: ILogger,
    private readonly _fileSystem: IFileSystem,
    private readonly _audioDir: string
  ) {}

  public async execute(): Promise<void> {
    this._logger.info('Starting audio regeneration for all cue packs', {
      audioDir: this._audioDir
    })

    this._logger.info('Clearing existing audio files', { audioDir: this._audioDir })
    try {
      await this._fileSystem.clearDirectory(this._audioDir)
      this._logger.info('Successfully cleared audio directory')
    } catch (error) {
      this._logger.error('Failed to clear audio directory', { error })
      throw new Error('Failed to clear audio directory')
    }

    const packsResult = await this._cuePackRepository.all()
    if (packsResult.isErr()) {
      this._logger.error('Failed to load cue packs', { error: packsResult.getError() })
      throw new Error('Failed to load cue packs')
    }

    const packs = packsResult.unwrap()
    const totalPacks = packs.length

    this._logger.info(`Found ${totalPacks} cue packs to process`)

    const uniqueCueTexts = new Set<string>()
    for (const pack of packs) {
      for (const cue of pack.cues) {
        uniqueCueTexts.add(cue.text)
      }
    }

    const totalUniqueCues = uniqueCueTexts.size
    let completedUniqueCues = 0
    const generatedCues = new Map<string, AudioFileName>()

    this._logger.info(`Total unique cues to regenerate: ${totalUniqueCues}`)

    let currentPackIndex = 0
    for (const pack of packs) {
      currentPackIndex++
      this._logger.info(`Processing pack: ${pack.name} (${currentPackIndex}/${totalPacks})`)

      for (const cue of pack.cues) {
        if (!generatedCues.has(cue.text)) {
          this._logger.info(`Generating audio for: "${cue.text}"`)

          const audioResult = await this._textToSpeechGenerator.generate(cue.text)

          if (audioResult.isErr()) {
            this._logger.error(`Failed to generate audio for cue: "${cue.text}"`, {
              error: audioResult.getError()
            })
            continue
          }

          const newAudioFileName = audioResult.unwrap()

          generatedCues.set(cue.text, newAudioFileName)
          completedUniqueCues++

          this._progressReporter.reportProgress(
            currentPackIndex,
            totalPacks,
            completedUniqueCues,
            totalUniqueCues
          )
        }

        const generatedAudioFileName = generatedCues.get(cue.text)
        if (generatedAudioFileName) {
          cue.audioUrl = generatedAudioFileName
        }
      }

      const saveResult = await this._cuePackRepository.save(pack)
      if (saveResult.isErr()) {
        this._logger.error(`Failed to save pack: ${pack.name}`, {
          error: saveResult.getError()
        })
      }

      this._logger.info(`Completed pack: ${pack.name} (${currentPackIndex}/${totalPacks})`)

      this._progressReporter.reportProgress(
        currentPackIndex,
        totalPacks,
        completedUniqueCues,
        totalUniqueCues
      )
    }

    this._logger.info('Audio regeneration completed successfully')
    this._progressReporter.reportComplete()
  }
}
