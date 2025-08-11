import OpenAI from 'openai'
import { InsightsService } from './InsightsService'
import { GameService } from './GameService'

export function createInsightsService(
  aiEnabled: boolean,
  apiKey: string | null,
  gameService: GameService
): InsightsService {
  if (!aiEnabled) {
    return new InsightsService(gameService)
  }

  if (aiEnabled && !apiKey) {
    return new InsightsService(gameService)
  }

  const openai = new OpenAI({
    apiKey: apiKey!
  })

  return new InsightsService(gameService, openai)
}
