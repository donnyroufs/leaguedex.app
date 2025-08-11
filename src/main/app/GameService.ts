import { Game, GameObject } from './Game'
import { AllGameData } from './game-assistance/IRiotClient'
import { GameRepository } from './GameRepository'
import { MatchupId } from './Matchup'
import { MatchupNote } from './MatchupNote'
import { MatchupService } from './MatchupService'
import { Logger } from './shared-kernel'

// TODO: we need to fetch the game from the actual RIOT api because we do not have access to the current match id
// This means that we will end up with duplicate(s). For now I created a quick and dirty solution to prevent this by making the ID unique.

export class GameService {
  public constructor(private readonly _gameRepository: GameRepository) {}

  /**
   * Eventually this will be listening to a domain event.
   */
  public async createGame(data: AllGameData): Promise<string> {
    const matchup = MatchupService.getMatchup(data)

    const game = new Game(this.createGameId(data), matchup.id, new Date(), 'in-progress', [])

    await this._gameRepository.create(game)

    Logger.log(`Created game ${game.id}`)

    return game.id
  }

  public async getGeneralNotes(): Promise<MatchupNote[]> {
    return this._gameRepository.getAllGeneralNotes()
  }

  public async getMatchupNotes(matchupId: MatchupId): Promise<MatchupNote[]> {
    const notes = await this._gameRepository.getNotesByMatchupId(matchupId)

    if (!notes) {
      return []
    }

    return notes.map((note) => ({
      ...note,
      createdAt: new Date(note.createdAt)
    }))
  }

  public async complete(gameId: string): Promise<void> {
    const game = await this._gameRepository.get(gameId)

    if (!game) {
      throw new Error('Game not found')
    }

    game.complete()

    await this._gameRepository.update(game)
  }

  public async review(gameId: string, matchupNotes: string, generalNotes: string): Promise<void> {
    const game = await this._gameRepository.get(gameId)

    if (!game) {
      throw new Error('Game not found')
    }

    game.review([
      new MatchupNote(crypto.randomUUID(), matchupNotes, game.matchupId, gameId, new Date()),
      new MatchupNote(
        crypto.randomUUID(),
        generalNotes,
        game.matchupId,
        gameId,
        new Date(),
        'general'
      )
    ])

    await this._gameRepository.update(game)
  }

  public async getAllGames(): Promise<GameObject[]> {
    return this._gameRepository.getAllCompletedGames()
  }

  private createGameId(data: AllGameData): string {
    const summonerName = data.activePlayer.summonerName
    const you = data.allPlayers.find((x) => x.summonerName === summonerName)
    const enemy = data.allPlayers.find((x) => x.position === you?.position && x.team !== you?.team)

    if (!you || !enemy) {
      throw new Error('Could not find players to create game ID')
    }

    const gameString =
      `${you.summonerName}-${you.championName}-vs-${enemy.summonerName}-${enemy.championName}`.toLowerCase()

    let hash = 0
    for (let i = 0; i < gameString.length; i++) {
      const char = gameString.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }

    return Math.abs(hash).toString(36)
  }
}
