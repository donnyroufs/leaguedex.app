import { MatchupId, parseMatchupId } from './Matchup'
import { GameService } from './GameService'
import { app } from 'electron'

export class InsightsService {
  public constructor(
    private readonly _gameService: GameService,
    private readonly _apiKey?: string
  ) {}

  public async generateInsights(matchupId: MatchupId): Promise<string | null> {
    const notes = await this._gameService.getMatchupNotes(matchupId)
    const generalNotes = await this._gameService.getGeneralNotes()

    if (notes.length === 0) {
      console.info('No notes found for matchup', matchupId)
      return null
    }

    if (!this._apiKey) {
      return [...notes, ...generalNotes]
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .map((note) => `- ${note.content}`)
        .join('\n')
    }

    try {
      const url = app.isPackaged
        ? 'https://api.donnyroufs.com/insights'
        : 'http://localhost:5005/insights'

      const res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({
          notes: notes.map((note) => ({
            content: note.content,
            createdAt: note.createdAt.toISOString(),
            type: note.type
          })),
          generalNotes: generalNotes.map((note) => ({
            content: note.content,
            createdAt: note.createdAt.toISOString(),
            type: note.type
          })),
          matchup: parseMatchupId(matchupId)
        }),
        headers: {
          'X-Api-Key': this._apiKey,
          'Content-Type': 'application/json'
        }
      })
      const json = await res.json()
      return json.insights
    } catch (err) {
      console.error('Error generating insights', err)
      return null
    }
  }
}
