import { MatchupNote } from './MatchupNote'

type GameStatus = 'in-progress' | 'completed' | 'reviewed'

export class Game {
  private _status: GameStatus = 'in-progress'

  public get status(): GameStatus {
    return this._status
  }

  public get notes(): Readonly<MatchupNote[]> {
    return this._notes
  }

  public constructor(
    public readonly id: string,
    public readonly matchupId: string,
    public readonly createdAt: Date,
    status: GameStatus,
    private _notes: MatchupNote[] = []
  ) {
    this._status = status
  }

  public review(notes: MatchupNote[]): void {
    if (this._status === 'reviewed') {
      throw new Error('Game already reviewed, cannot review again')
    }

    this._status = 'reviewed'
    this._notes = notes
  }

  public complete(): void {
    if (this._status === 'completed') {
      throw new Error('Game already completed, cannot complete again')
    }

    this._status = 'completed'
  }

  public toObject(): GameObject {
    return {
      id: this.id,
      matchupId: this.matchupId,
      createdAt: this.createdAt.toISOString(),
      status: this.status,
      notes: this.notes
    }
  }

  public static fromObject(object: GameObject): Game {
    return new Game(
      object.id,
      object.matchupId,
      new Date(object.createdAt),
      object.status,
      object.notes.map((note) => ({
        ...note,
        createdAt: new Date(note.createdAt)
      }))
    )
  }
}
// public readonly riotGameId: string,
// public readonly riotGameVersion: string,

export type GameObject = Pick<Game, 'id' | 'matchupId' | 'status' | 'notes'> & {
  createdAt: string
}