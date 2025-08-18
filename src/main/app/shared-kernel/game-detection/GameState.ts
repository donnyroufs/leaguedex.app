export class GameState {
  /**
   * 0 means that the game is in loading screen.
   */
  public get isInGame(): boolean {
    return this.gameTick > 0
  }

  public constructor(public readonly gameTick: number) {}
}
