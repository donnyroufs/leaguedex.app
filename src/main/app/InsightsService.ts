import OpenAI from 'openai'
import { MatchupId } from './Matchup'
import { GameService } from './GameService'

export class InsightsService {
  public constructor(
    private readonly _gameService: GameService,
    private readonly _openai?: OpenAI
  ) {}

  public async generateInsights(matchupId: MatchupId): Promise<string | null> {
    const notes = await this._gameService.getNotes(matchupId)

    if (notes.length === 0) {
      console.info('No notes found for matchup', matchupId)
      return null
    }

    if (!this._openai) {
      return [...notes]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((note) => `<p>${note.createdAt.toLocaleDateString()}: ${note.content}</p>`)
        .join('\n')
    }

    try {
      const response = await this._openai!.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a League of Legends matchup analyst. Your goal is to help the player get into the right mindset for this specific matchup. Based on the provided notes, generate a concise one-paragraph summary that will help them remember key aspects and mentally prepare. Focus on the most important patterns, core strategies, and crucial reminders from their past experiences. Include specific power spikes, trading patterns, and win conditions they have identified. Keep it focused only on insights from their notes - do not make assumptions or add information beyond what they have recorded. The summary should serve as a quick but powerful refresher of their learnings.'
          },
          { role: 'user', content: notes.map((note) => note.content).join('\n') }
        ]
      })

      return response.choices[0].message.content ?? null
    } catch (err) {
      console.error(err)
      return null
    }
  }
}
