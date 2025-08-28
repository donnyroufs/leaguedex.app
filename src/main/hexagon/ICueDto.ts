import { CueObjective, CueTriggerType } from './Cue'

export interface ICueDto {
  id: string
  text: string
  triggerType: CueTriggerType
  interval?: number
  triggerAt?: number
  event?: string
  objective?: CueObjective
  beforeObjective?: number
}
