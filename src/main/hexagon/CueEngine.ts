import { GameState } from './GameState'
import { Cue } from './Cue'

export class CueEngine {
  public static getDueCues(state: GameState, cues: ReadonlyArray<Cue>): Cue[] {
    return cues.filter((cue) => {
      if (cue.triggerType === 'interval' && cue.interval) {
        return state.gameTime % cue.interval === 0
      }

      if (cue.triggerType === 'oneTime' && cue.triggerAt) {
        return state.gameTime === cue.triggerAt
      }

      if (cue.triggerType === 'event' && cue.event === 'respawn') {
        return state.activePlayer.respawnsIn === 1
      }

      if (cue.triggerType === 'event' && cue.event === 'canon-wave-spawned') {
        const firstCanonWave = 155
        const lastCanonWave = 905

        if (state.gameTime < firstCanonWave || state.gameTime > lastCanonWave) {
          return false
        }

        if (state.gameTime === firstCanonWave) {
          return true
        }

        const elapsed = state.gameTime - firstCanonWave

        return elapsed % 90 === 0
      }

      if (cue.triggerType === 'objective' && cue.objective != null) {
        const nextSpawn = state.objectives[cue.objective]?.nextSpawn

        if (!nextSpawn) {
          return false
        }

        return state.gameTime === nextSpawn - cue.beforeObjective!
      }

      return false
    })
  }
}
