export type FiringMode =
  | { mode: 'edge' }
  | { mode: 'edgeWithCooldown'; cooldownSeconds: number }
  | { mode: 'oncePerGame' }

/**
 * Tracks per-cue firing history so predicate-based cues respect edge-triggered,
 * cooldown, and once-per-game semantics. State is cleared between games.
 */
export class FiringStateStore {
  private readonly _previousMatch = new Map<string, boolean>()
  private readonly _lastFired = new Map<string, number>()
  private readonly _firedThisGame = new Set<string>()

  public shouldFire(
    cueId: string,
    isMatching: boolean,
    mode: FiringMode,
    gameTime: number
  ): boolean {
    const wasMatching = this._previousMatch.get(cueId) ?? false
    this._previousMatch.set(cueId, isMatching)

    if (!isMatching) return false

    const isEdge = !wasMatching

    switch (mode.mode) {
      case 'edge': {
        if (!isEdge) return false
        this._lastFired.set(cueId, gameTime)
        return true
      }
      case 'edgeWithCooldown': {
        const lastFired = this._lastFired.get(cueId)
        if (lastFired !== undefined && gameTime - lastFired < mode.cooldownSeconds) {
          return false
        }
        if (lastFired === undefined || isEdge || gameTime - lastFired >= mode.cooldownSeconds) {
          this._lastFired.set(cueId, gameTime)
          return true
        }
        return false
      }
      case 'oncePerGame': {
        if (this._firedThisGame.has(cueId)) return false
        if (!isEdge) return false
        this._firedThisGame.add(cueId)
        this._lastFired.set(cueId, gameTime)
        return true
      }
    }
  }

  public clear(): void {
    this._previousMatch.clear()
    this._lastFired.clear()
    this._firedThisGame.clear()
  }
}
