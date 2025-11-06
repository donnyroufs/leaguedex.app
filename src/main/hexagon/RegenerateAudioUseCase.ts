import { IUseCase } from '../shared-kernel/IUseCase'
import { ICuePackRepository } from './ports/ICuePackRepository'
import { ITextToSpeechGenerator } from './ports/ITextToSpeechGenerator'
import { IAudioRegenerationProgressReporter } from './ports/IAudioRegenerationProgressReporter'
import { ILogger } from './ports/ILogger'
import { AudioFileName } from './AudioFileName'

export class RegenerateAudioUseCase implements IUseCase<void, void> {
  public constructor(
    private readonly _cuePackRepository: ICuePackRepository,
    private readonly _textToSpeechGenerator: ITextToSpeechGenerator,
    private readonly _progressReporter: IAudioRegenerationProgressReporter,
    private readonly _logger: ILogger,
    private readonly _audioDir: string // Used for logging and future extensions
  ) {}

  public async execute(): Promise<void> {
    this._logger.info('Starting audio regeneration for all cue packs', {
      audioDir: this._audioDir
    })

    // Load all cue packs
    const packsResult = await this._cuePackRepository.all()
    if (packsResult.isErr()) {
      this._logger.error('Failed to load cue packs', { error: packsResult.getError() })
      throw new Error('Failed to load cue packs')
    }

    const packs = packsResult.unwrap()
    const totalPacks = packs.length

    this._logger.info(`Found ${totalPacks} cue packs to process`)

    // Collect all unique cue texts across all packs
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

    // Process each pack
    let currentPackIndex = 0
    for (const pack of packs) {
      currentPackIndex++
      this._logger.info(`Processing pack: ${pack.name} (${currentPackIndex}/${totalPacks})`)

      // Regenerate audio for each cue in the pack
      for (const cue of pack.cues) {
        // Check if we've already generated this cue text
        if (!generatedCues.has(cue.text)) {
          this._logger.info(`Generating audio for: "${cue.text}"`)

          const audioResult = await this._textToSpeechGenerator.generate(cue.text)

          if (audioResult.isErr()) {
            this._logger.error(`Failed to generate audio for cue: "${cue.text}"`, {
              error: audioResult.getError()
            })
            // Continue with other cues instead of failing completely
            continue
          }

          const newAudioFileName = audioResult.unwrap()

          // Store the new audio file name so we can update all cues with this text
          generatedCues.set(cue.text, newAudioFileName)
          completedUniqueCues++

          // Report progress after each unique cue is generated
          this._progressReporter.reportProgress(
            currentPackIndex,
            totalPacks,
            completedUniqueCues,
            totalUniqueCues
          )
        }

        // Update this cue's audioUrl with the newly generated audio file
        const generatedAudioFileName = generatedCues.get(cue.text)
        if (generatedAudioFileName) {
          cue.audioUrl = generatedAudioFileName
        }
      }

      // Save the pack (in case the AudioFileName changed)
      const saveResult = await this._cuePackRepository.save(pack)
      if (saveResult.isErr()) {
        this._logger.error(`Failed to save pack: ${pack.name}`, {
          error: saveResult.getError()
        })
      }

      this._logger.info(`Completed pack: ${pack.name} (${currentPackIndex}/${totalPacks})`)

      // Report progress after each pack is completed
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
