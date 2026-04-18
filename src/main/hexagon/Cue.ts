import { AudioFileName } from './AudioFileName'
import { FiringMode } from './triggers/FiringMode'
import { Predicate } from './triggers/Predicate'

export type CueObjective = 'dragon' | 'baron' | 'grubs' | 'herald' | 'atakhan'

export type BuiltInTriggerId = 'canon-wave-spawned' | 'support-item-upgraded'

export type CueTrigger =
  | { kind: 'interval'; seconds: number }
  | { kind: 'oneTime'; at: number }
  | { kind: 'objective'; objective: CueObjective; secondsBefore: number }
  | { kind: 'predicate'; predicate: Predicate; firing: FiringMode }
  | { kind: 'builtIn'; id: BuiltInTriggerId }

export type Cue = {
  id: string
  text: string
  audioUrl: AudioFileName
  trigger: CueTrigger
  endTime?: number
}
