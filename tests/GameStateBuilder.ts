import {
  BaronKilledEvent,
  DragonKilledEvent,
  GameEvent,
  GameStartedEvent,
  GameState
} from './../src/main/hexagon'

export class GameStateBuilder {
  private _eventCounter = 0
  private _gameTime: number = 0
  private _events: GameEvent<unknown>[] = []

  public withGameTime(gameTime: number): GameStateBuilder {
    this._gameTime = gameTime
    return this
  }

  public withGameStartedEvent(): GameStateBuilder {
    this._events.push(
      new GameStartedEvent(this.getNextId(), {
        gameTime: this._gameTime
      })
    )

    return this
  }

  public withDragonKilledEvent(killedAt: number): GameStateBuilder {
    this._events.push(
      new DragonKilledEvent(this.getNextId(), {
        gameTime: killedAt
      })
    )
    return this
  }

  public withBaronKilledEvent(killedAt: number): GameStateBuilder {
    this._events.push(
      new BaronKilledEvent(this.getNextId(), {
        gameTime: killedAt
      })
    )

    return this
  }

  public build(): GameState {
    return {
      gameTime: this._gameTime,
      events: this._events,
      activePlayer: {
        summonerName: 'Player 1',
        isAlive: true,
        respawnsIn: null
      }
    }
  }

  private getNextId(): number {
    return ++this._eventCounter
  }

  public static asNewGame(): GameStateBuilder {
    return new GameStateBuilder().withGameStartedEvent()
  }
}
