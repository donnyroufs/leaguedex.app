import { GameState } from './GameState'
import { Cue } from './Cue'

export class CueEngine {
  private static lastTriggeredByEvent: Map<string, number> = new Map<string, number>()

  public static getDueCues(state: GameState, cues: ReadonlyArray<Cue>): Cue[] {
    return cues.filter((cue) => {
      if (cue.endTime && state.gameTime >= cue.endTime) {
        return false
      }

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

      if (cue.triggerType === 'event' && cue.event === 'mana-changed') {
        const isDue = this.onManaChangedEvent(state, cue)
        const lastTriggered = this.lastTriggeredByEvent.get(cue.event)

        if (isDue && lastTriggered === undefined) {
          this.lastTriggeredByEvent.set(cue.event, state.gameTime)
          return true
        }

        return isDue && lastTriggered !== undefined && state.gameTime - lastTriggered >= 60
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

  public static clear(): void {
    this.lastTriggeredByEvent.clear()
  }

  private static onManaChangedEvent(state: GameState, cue: Cue): boolean {
    const isManaChampion = state.activePlayer.currentMana != null

    if (!isManaChampion) {
      return false
    }

    if (!cue.value || state.activePlayer.currentMana === null) {
      return false
    }

    if (state.activePlayer.currentMana === cue.value) {
      return false
    }

    return state.activePlayer.currentMana <= cue.value
  }
}
