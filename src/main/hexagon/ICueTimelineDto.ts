import { ICueDto } from './ICueDto'

export type CueTimelineEntryDto = {
  cue: ICueDto
  triggeredAt: number
  playedAt: number
}

export type CueTimelineDto = {
  past: CueTimelineEntryDto[]
  current: CueTimelineEntryDto | null
  upcoming: ICueDto[]
}
