import { AudioFileName } from './AudioFileName'

/**
 * The trigger type of a cue.
 * - `interval`: cue that triggers every `interval` seconds.
 * - `oneTime`: cue that triggers at a specific time.
 * - `event`: cue that triggers when a specific event occurs.
 */
export type CueTriggerType = 'interval' | 'oneTime' | 'event' | 'objective'
export type CueObjective = 'dragon' | 'baron' | 'grubs' | 'herald' | 'atakhan'

export type Cue = {
  id: string
  text: string
  audioUrl: AudioFileName
  triggerType: CueTriggerType
  interval?: number
  triggerAt?: number
  event?: string
  objective?: CueObjective
  beforeObjective?: number
}
