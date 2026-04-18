import { Cue, CueTrigger } from './Cue'
import { CuePack } from './CuePack'
import { ITextToSpeechGenerator } from './ports/ITextToSpeechGenerator'

export const CURRENT_PACK_FORMAT_VERSION = 1

type EncodedCue = {
  text: string
  trigger: CueTrigger
  endTime?: number
}

type EncodedCuePack = {
  version: number
  name: string
  cues: EncodedCue[]
}

export class CuePackEncoder {
  public static encode(cuepack: CuePack): string {
    const encodedCuePack: EncodedCuePack = {
      version: CURRENT_PACK_FORMAT_VERSION,
      name: cuepack.name,
      cues: cuepack.cues.map((cue) => ({
        text: cue.text,
        trigger: cue.trigger,
        endTime: cue.endTime
      }))
    }

    return btoa(JSON.stringify(encodedCuePack))
  }

  public static async decode(
    code: string,
    audioGenerator: ITextToSpeechGenerator
  ): Promise<CuePack> {
    const parsed = JSON.parse(atob(code)) as Partial<EncodedCuePack>

    if (parsed.version !== CURRENT_PACK_FORMAT_VERSION) {
      throw new Error(
        `Unsupported pack format version: ${parsed.version}. Expected ${CURRENT_PACK_FORMAT_VERSION}.`
      )
    }

    const encodedCuePack = parsed as EncodedCuePack
    const cuePack = CuePack.create(encodedCuePack.name)

    const cuePromises = encodedCuePack.cues.map(async (encodedCue): Promise<Cue> => {
      const audio = await audioGenerator.generate(encodedCue.text)

      if (audio.isErr()) {
        throw new Error('Failed to generate audio')
      }

      return {
        id: crypto.randomUUID(),
        text: encodedCue.text,
        audioUrl: audio.unwrap(),
        trigger: encodedCue.trigger,
        endTime: encodedCue.endTime
      }
    })

    const cues = await Promise.all(cuePromises)
    cues.forEach((cue) => cuePack.add(cue))

    return cuePack
  }
}
