import z from 'zod'
import { IUseCase } from '../shared-kernel/IUseCase'
import { Cue, ICuePackRepository, ITextToSpeechGenerator } from '.'
import { triggerSchema } from './AddCueToPackUseCase'

const editCueSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  trigger: triggerSchema,
  packId: z.string().min(1),
  endTime: z.number().int().positive().optional()
})

export type EditCueDto = Omit<z.infer<typeof editCueSchema>, 'id'>
type EditCueInput = z.infer<typeof editCueSchema>

export class EditCueInPackUseCase implements IUseCase<EditCueInput, void> {
  public constructor(
    private readonly _audioGenerator: ITextToSpeechGenerator,
    private readonly _cuePackRepository: ICuePackRepository
  ) {}

  public async execute(data: EditCueInput): Promise<void> {
    const parsedData = editCueSchema.parse(data)

    const cuePack = await this._cuePackRepository.load(parsedData.packId)
    const cuePackResult = cuePack.unwrap()

    if (!cuePackResult) {
      throw new Error('Cue pack not found')
    }

    const existingCue = cuePackResult.cues.find((c) => c.id === parsedData.id)
    if (!existingCue) {
      throw new Error('Cue not found')
    }

    let audioUrl = existingCue.audioUrl
    if (existingCue.text !== parsedData.text) {
      const result = await this._audioGenerator.generate(parsedData.text)
      audioUrl = result.unwrap()
    }

    const updatedCue: Cue = {
      id: parsedData.id,
      text: parsedData.text,
      audioUrl,
      trigger: parsedData.trigger,
      endTime: parsedData.endTime
    }

    cuePackResult.remove(parsedData.id)
    cuePackResult.add(updatedCue)

    const saveResult = await this._cuePackRepository.save(cuePackResult)

    if (!saveResult.isOk()) {
      throw new Error('Failed to save cue pack')
    }
  }
}
