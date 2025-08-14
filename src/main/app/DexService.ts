import { GameService } from './GameService'

type Champion = {
  id: string
  name: string
  title: string
  imageUrl: string
  matchupIds: string[]
}

type Dex = {
  champions: Champion[]
}

type RiotChampion = {
  id: string
  name: string
  title: string
}

export class DexService {
  public constructor(private readonly _gameService: GameService) {}

  // TODO: game version
  public async all(): Promise<Dex> {
    const riotChampions = await fetch(
      'https://ddragon.leagueoflegends.com/cdn/15.16.1/data/en_US/champion.json'
    )
    const data = await riotChampions.json()
    const games = await this._gameService.getAllGames()

    const matchupIds = games.map((g) => g.matchupId)

    const champions = Object.values(data.data).map((champion: unknown) => {
      const riotChampion = champion as RiotChampion
      const championId = riotChampion.id.toLowerCase()
      return {
        id: championId,
        name: riotChampion.name,
        title: riotChampion.title,
        imageUrl: `https://ddragon.leagueoflegends.com/cdn/img/champion/centered/${riotChampion.id}_0.jpg`,
        matchupIds: matchupIds.filter((id) => id.startsWith(`${championId}-`))
      }
    })

    return {
      champions
    }
  }
}
