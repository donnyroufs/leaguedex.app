import { CueTrigger } from './Cue'

export interface ICueDto {
  id: string
  text: string
  trigger: CueTrigger
  endTime?: number
}
