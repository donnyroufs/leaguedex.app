import { Cue } from './Cue'
import { ObjectiveState } from './GameState'

export type CueTimelineEntry = {
  cue: Cue
  triggeredAt: number
  playedAt: number
}

export type CueTimeline = {
  past: CueTimelineEntry[]
  current: CueTimelineEntry | null
  upcoming: Cue[]
}

export class CueTimelineTracker {
  private _past: CueTimelineEntry[] = []
  private _current: CueTimelineEntry | null = null
  private _dueCues: Map<string, number> = new Map()

  public addDueCue(cue: Cue, gameTime: number): void {
    this._dueCues.set(cue.id, gameTime)
  }

  public onCueStarted(cue: Cue): void {
    if (this._current) {
      this._addToPast(this._current)
    }

    const triggeredAt = this._dueCues.get(cue.id) ?? 0
    this._current = {
      cue,
      triggeredAt,
      playedAt: Date.now()
    }
  }

  public onCueFinished(cue: Cue): void {
    if (this._current && this._current.cue.id === cue.id) {
      this._addToPast(this._current)
      this._current = null
    }
  }

  public getTimeline(
    gameTime: number,
    allCues: ReadonlyArray<Cue>,
    objectives?: ObjectiveState
  ): CueTimeline {
    return {
      past: this._past,
      current: this._current,
      upcoming: this._calculateUpcoming(gameTime, allCues, objectives)
    }
  }

  public reset(): void {
    this._past = []
    this._current = null
    this._dueCues.clear()
  }

  private _addToPast(entry: CueTimelineEntry): void {
    this._past.push(entry)

    if (this._past.length > 3) {
      this._past.shift()
    }
  }

  private _calculateUpcoming(
    gameTime: number,
    allCues: ReadonlyArray<Cue>,
    objectives?: ObjectiveState
  ): Cue[] {
    type CueWithTriggerTime = {
      cue: Cue
      nextTriggerTime: number
    }

    const upcoming: CueWithTriggerTime[] = []

    for (const cue of allCues) {
      if (cue.endTime !== undefined && gameTime > cue.endTime) {
        continue
      }

      if (this._current && this._current.cue.id === cue.id) {
        continue
      }

      if (cue.triggerType === 'oneTime' && cue.triggerAt !== undefined) {
        if (gameTime >= cue.triggerAt) {
          continue
        }
        upcoming.push({ cue, nextTriggerTime: cue.triggerAt })
        continue
      }

      if (cue.triggerType === 'interval' && cue.interval !== undefined) {
        const nextTriggerTime = gameTime + (cue.interval - (gameTime % cue.interval))
        upcoming.push({ cue, nextTriggerTime })
        continue
      }

      if (
        cue.triggerType === 'objective' &&
        cue.objective &&
        cue.beforeObjective !== undefined &&
        objectives
      ) {
        const objectiveInfo = objectives[cue.objective]

        if (objectiveInfo && objectiveInfo.nextSpawn !== null) {
          const triggerTime = objectiveInfo.nextSpawn - cue.beforeObjective

          if (triggerTime > gameTime) {
            upcoming.push({ cue, nextTriggerTime: triggerTime })
          }
        }
        continue
      }

      if (cue.triggerType === 'event') {
        continue
      }
    }

    return upcoming
      .sort((a, b) => a.nextTriggerTime - b.nextTriggerTime)
      .slice(0, 2)
      .map((x) => x.cue)
  }
}
