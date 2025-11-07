import { BaronKilledEvent, DragonKilledEvent, GameData, GameEvent, Team } from '../src/main/hexagon'

export class TestGameDataBuilder {
  private _gameTime: number = 0
  private _hasStarted: boolean = false
  private _events: GameEvent<unknown>[] = []
  private _idCounter: number = 0
  private _currentMana: number = 0
  private _totalMana: number = 1000
  private _currentGold: number = 0

  public hasStarted(): TestGameDataBuilder {
    this._hasStarted = true
    return this
  }

  public withBaronKilledEvent(killedAt: number): TestGameDataBuilder {
    this._events.push(new BaronKilledEvent(this._idCounter++, { gameTime: killedAt }))
    return this
  }

  public withDragonKilledEvent(killedAt: number, killedByTeam: Team = 'red'): TestGameDataBuilder {
    this._events.push(
      new DragonKilledEvent(this._idCounter++, { gameTime: killedAt, killedByTeam })
    )
    return this
  }

  public withCurrentPlayerMana(mana: number): TestGameDataBuilder {
    this._currentMana = mana
    return this
  }

  public withTotalMana(totalMana: number): TestGameDataBuilder {
    this._totalMana = totalMana
    return this
  }

  public withCurrentGold(gold: number): TestGameDataBuilder {
    this._currentGold = gold
    return this
  }

  /**
   * Starts the game at a specific moment
   */
  public withGameTime(gameTime: number): TestGameDataBuilder {
    this.hasStarted()
    this._gameTime = gameTime
    return this
  }

  public build(): GameData {
    return {
      hasStarted: this._hasStarted,
      gameTime: this._gameTime,
      events: this._events,
      activePlayer: {
        summonerName: 'Test',
        isAlive: true,
        respawnsIn: null,
        currentMana: this._currentMana,
        totalMana: this._totalMana,
        currentGold: this._currentGold,
        items: []
      }
    }
  }
}
