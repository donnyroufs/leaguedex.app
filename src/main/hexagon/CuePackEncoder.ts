import { CueObjective, CueTriggerType } from './Cue'
import { CuePack } from './CuePack'
import { ITextToSpeechGenerator } from './ports/ITextToSpeechGenerator'

/**
 * Basically in a Create form
 */
type EncodedCue = {
  text: string
  triggerType: CueTriggerType
  interval?: number
  triggerAt?: number
  event?: string
  objective?: CueObjective
  beforeObjective?: number
}

type EncodedCuePack = {
  name: string
  cues: EncodedCue[]
}

export class CuePackEncoder {
  public static encode(cuepack: CuePack): string {
    const encodedCuePack: EncodedCuePack = {
      name: cuepack.name,
      cues: cuepack.cues.map((cue) => ({
        text: cue.text,
        triggerType: cue.triggerType,
        interval: cue.interval,
        triggerAt: cue.triggerAt,
        event: cue.event,
        objective: cue.objective,
        beforeObjective: cue.beforeObjective
      }))
    }

    return btoa(JSON.stringify(encodedCuePack))
  }

  public static async decode(
    code: string,
    audioGenerator: ITextToSpeechGenerator
  ): Promise<CuePack> {
    const encodedCuePack: EncodedCuePack = JSON.parse(atob(code))
    const cuePack = CuePack.create(encodedCuePack.name)

    const cuePromises = encodedCuePack.cues.map(async (cue) => {
      const audio = await audioGenerator.generate(cue.text)

      if (audio.isErr()) {
        throw new Error('Failed to generate audio')
      }

      return {
        id: crypto.randomUUID(),
        text: cue.text,
        audioUrl: audio.unwrap(),
        triggerType: cue.triggerType,
        interval: cue.interval,
        triggerAt: cue.triggerAt,
        event: cue.event,
        objective: cue.objective,
        beforeObjective: cue.beforeObjective
      }
    })

    const cues = await Promise.all(cuePromises)
    cues.forEach((cue) => cuePack.add(cue))

    return cuePack
  }
}
