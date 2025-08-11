import fs from 'fs/promises'
import { access, constants, writeFileSync } from 'fs'
import { Game, GameObject } from './Game'
import { MatchupNote } from './MatchupNote'
import { MatchupId } from './Matchup'

export class GameRepository {
  public constructor(private readonly _path: string) {}

  public configure(): void {
    access(this._path, constants.F_OK, (err) => {
      if (!err) {
        console.info(`Game storage file already exists at ${this._path}.`)
        return
      }

      console.error(err)
      console.info(`Game storage file does not exist at ${this._path}. Creating it...`)
      writeFileSync(this._path, '[]')
      console.info(`Game storage file created at ${this._path}.`)
    })
  }

  public async getNotesByMatchupId(matchupId: MatchupId): Promise<MatchupNote[]> {
    const content = await fs.readFile(this._path, 'utf-8')
    const parsedData = JSON.parse(content)
    const games: Game[] = parsedData.map(Game.fromObject)
    const matchupGames = games.filter((g) => g.matchupId === matchupId)

    if (matchupGames.length === 0) {
      return []
    }

    return matchupGames.flatMap((game) => game.notes.slice())
  }

  public async get(gameId: string): Promise<Game | null> {
    const content = await fs.readFile(this._path, 'utf-8')
    const parsedData: GameObject[] = JSON.parse(content)

    return parsedData.map(Game.fromObject).find((x) => x.id === gameId) ?? null
  }

  public async update(game: Game): Promise<void> {
    const content = await fs.readFile(this._path, 'utf-8')
    const parsedData: GameObject[] = JSON.parse(content)
    const games = parsedData.map(Game.fromObject)
    const index = games.findIndex((g) => g.id === game.id)

    if (index === -1) {
      throw new Error('Game not found')
    }

    games[index] = game
    await fs.writeFile(this._path, JSON.stringify(games.map((g) => g.toObject())))
  }

  public async create(game: Game): Promise<void> {
    let games: Game[] = []

    try {
      const content = await fs.readFile(this._path, 'utf-8')
      const parsedData: GameObject[] = JSON.parse(content)
      if (Array.isArray(parsedData)) {
        games = parsedData.map(Game.fromObject)
      } else {
        games = []
      }
    } catch (err) {
      console.error(err)
    }

    if (!games.some((g) => g.id === game.id)) {
      games.push(game)

      // TODO: this is a quick hack that we need to move outside of the repository.
      const existingInProgressGame = games.find(
        (g) => g.status === 'in-progress' && g.id !== game.id
      )

      if (existingInProgressGame) {
        existingInProgressGame.complete()
      }
      // end

      await fs.writeFile(this._path, JSON.stringify(games.map((g) => g.toObject())))
    }
  }

  public async getAllCompletedGames(): Promise<GameObject[]> {
    try {
      const content = await fs.readFile(this._path, 'utf-8')
      const parsedData: GameObject[] = JSON.parse(content)
      return parsedData.filter((x) => x.status !== 'in-progress')
    } catch (err) {
      console.error(err)
      return []
    }
  }
}
