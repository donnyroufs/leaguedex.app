import fs from 'fs/promises'
import { Game } from './Game'
import { MatchupNote } from './MatchupNote'
import { MatchupId } from './Matchup'

export class GameRepository {
  public constructor(private readonly _path: string) {}

  public async getNotesByMatchupId(matchupId: MatchupId): Promise<MatchupNote[]> {
    const content = await fs.readFile(this._path, 'utf-8')
    const parsedData = JSON.parse(content)
    const games: Game[] = parsedData.map((g) =>
      typeof g === 'string'
        ? Game.fromJSON(g)
        : new Game(g.id, g.matchupId, new Date(g.createdAt), g.status, g.notes)
    )
    const matchupGames = games.filter((g) => g.matchupId === matchupId)

    if (matchupGames.length === 0) {
      return []
    }

    return matchupGames.flatMap((game) => game.notes.slice())
  }

  public async get(gameId: string): Promise<Game | null> {
    const content = await fs.readFile(this._path, 'utf-8')
    const parsedData = JSON.parse(content)
    const games = parsedData.map((g) =>
      typeof g === 'string'
        ? Game.fromJSON(g)
        : new Game(g.id, g.matchupId, new Date(g.createdAt), g.status, g.notes)
    )
    const game = games.find((g) => g.id === gameId)

    if (!game) return null

    return game
  }

  public async update(game: Game): Promise<void> {
    const content = await fs.readFile(this._path, 'utf-8')
    const parsedData = JSON.parse(content)
    const games = parsedData.map((g) =>
      typeof g === 'string'
        ? Game.fromJSON(g)
        : new Game(g.id, g.matchupId, new Date(g.createdAt), g.status, g.notes)
    )
    const index = games.findIndex((g) => g.id === game.id)

    if (index === -1) {
      throw new Error('Game not found')
    }

    games[index] = game
    await fs.writeFile(this._path, `[${games.map((g) => g.toJSON()).join(',')}]`)
  }

  public async create(game: Game): Promise<void> {
    let games: Game[] = []

    try {
      const content = await fs.readFile(this._path, 'utf-8')
      const parsed = JSON.parse(content)
      games = Array.isArray(parsed) ? parsed : []
    } catch {
      console.error('Could not read games file')
    }

    if (!games.some((g) => g.id === game.id)) {
      games.push(game)
      await fs.writeFile(this._path, `[${games.map((g) => g.toJSON()).join(',')}]`)
    }
  }

  public async getAllCompletedGames(): Promise<Game[]> {
    try {
      const content = await fs.readFile(this._path, 'utf-8')
      const parsedData = JSON.parse(content)
      const games = parsedData.map((g) =>
        typeof g === 'string'
          ? Game.fromJSON(g)
          : new Game(g.id, g.matchupId, new Date(g.createdAt), g.status, g.notes)
      )

      return games
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .filter((g) => g.status === 'completed' || g.status === 'reviewed')
    } catch {
      console.error('Could not read games file')
      return []
    }
  }
}
