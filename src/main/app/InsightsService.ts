import OpenAI from 'openai'
import { MatchupId } from './Matchup'
import { GameService } from './GameService'

export class InsightsService {
  public constructor(
    private readonly _gameService: GameService,
    private readonly _openai?: OpenAI
  ) {}

  public async generateInsights(matchupId: MatchupId): Promise<string | null> {
    const notes = await this._gameService.getMatchupNotes(matchupId)
    const generalNotes = await this._gameService.getGeneralNotes()

    if (notes.length === 0) {
      console.info('No notes found for matchup', matchupId)
      return null
    }

    if (!this._openai) {
      return [...notes, ...generalNotes]
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .map((note) => `- ${note.content}`)
        .join('\n')
    }

    try {
      const response = await this._openai!.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are my League of Legends coach. Analyze my matchup notes and give a very concise response:

# Matchup Overview
1. One sentence overview of the matchup based on my notes

# Key Matchup Points
2. 2-3 key bullet points I should remember from matchup-specific notes

# General Focus Areas
3. Key focus areas from my general notes

Keep it brief and actionable. No fluff or extra explanations needed.`
          },
          {
            role: 'user',
            content: `
Dataset:

Specific matchup notes
${JSON.stringify(notes)}


General notes
${JSON.stringify(generalNotes)}
`
          }
        ]
      })
      const content = response.choices[0].message.content ?? null
      return content
    } catch (err) {
      console.error(err)
      return null
    }
  }
}
