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
        if (state.gameTime < 65 || state.gameTime > 905) {
          return false
        }

        const elapsed = state.gameTime - 65

        if (elapsed % 30 === 0) {
          const currentWave = Math.floor(elapsed / 30) + 1
          return currentWave % 4 === 0
        }

        return false
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
