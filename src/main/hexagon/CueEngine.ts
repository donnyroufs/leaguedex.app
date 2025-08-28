import { GameState } from './GameState'
import { Cue } from './Cue'

export class CueEngine {
  public static getDueCues(state: GameState, cues: Cue[]): Cue[] {
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
