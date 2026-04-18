import { GameState } from './GameState'
import { Cue, BuiltInTriggerId } from './Cue'
import { SupportItems } from './SupportItems'
import { FiringStateStore } from './triggers/FiringMode'
import { PredicateEvaluator } from './triggers/PredicateEvaluator'

export class CueEngine {
  private static readonly firingStore = new FiringStateStore()
  private static previousItems: readonly number[] = []

  public static getDueCues(state: GameState, cues: ReadonlyArray<Cue>): Cue[] {
    return cues.filter((cue) => this.isDue(cue, state))
  }

  public static clear(): void {
    this.firingStore.clear()
    this.previousItems = []
  }

  private static isDue(cue: Cue, state: GameState): boolean {
    if (cue.endTime !== undefined && state.gameTime > cue.endTime) {
      return false
    }

    switch (cue.trigger.kind) {
      case 'interval':
        return state.gameTime % cue.trigger.seconds === 0
      case 'oneTime':
        return state.gameTime === cue.trigger.at
      case 'objective': {
        const nextSpawn = state.objectives[cue.trigger.objective]?.nextSpawn
        if (nextSpawn === null || nextSpawn === undefined) return false
        return state.gameTime === nextSpawn - cue.trigger.secondsBefore
      }
      case 'predicate': {
        const matches = PredicateEvaluator.evaluate(cue.trigger.predicate, state)
        return this.firingStore.shouldFire(cue.id, matches, cue.trigger.firing, state.gameTime)
      }
      case 'builtIn':
        return this.evaluateBuiltIn(cue.trigger.id, state)
    }
  }

  private static evaluateBuiltIn(id: BuiltInTriggerId, state: GameState): boolean {
    switch (id) {
      case 'canon-wave-spawned': {
        const firstCanonWave = 155
        if (state.gameTime < firstCanonWave) return false
        if (state.gameTime === firstCanonWave) return true
        const elapsed = state.gameTime - firstCanonWave
        return elapsed % 90 === 0
      }
      case 'support-item-upgraded':
        return this.hasSupportItemUpgrade(state.activePlayer.items)
    }
  }

  private static hasSupportItemUpgrade(currentItems: readonly number[]): boolean {
    const items = currentItems ?? []
    const addedItems = items.filter((itemId) => !this.previousItems.includes(itemId))
    const removedItems = this.previousItems.filter((itemId) => !items.includes(itemId))

    for (const removedItemId of removedItems) {
      for (const addedItemId of addedItems) {
        if (SupportItems.isUpgrade(removedItemId, addedItemId)) {
          this.previousItems = items
          return true
        }
      }
    }

    this.previousItems = items
    return false
  }
}
