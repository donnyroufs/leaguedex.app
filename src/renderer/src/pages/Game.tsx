import { JSX, useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router'

type Game = {
  id: string
  matchupId: string
  createdAt: string
  status: 'in-progress' | 'completed' | 'reviewed'
  notes: {
    id: string
    content: string
    matchupId: string
    gameId: string
    createdAt: string
    type: 'matchup' | 'general'
  }[]
}

export function Game(): JSX.Element {
  const { gameId } = useParams()
  const [game, setGame] = useState<Game | null>(null)
  const [matchup, setMatchup] = useState<{
    you: { name: string; role: string }
    enemy: { name: string; role: string }
  } | null>(null)
  const [notes, setNotes] = useState<string>('')
  const [generalInsights, setGeneralInsights] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)

  const loadGame = useCallback(async (): Promise<void> => {
    try {
      const games = await window.api.getGames()
      const foundGame = games.find((g) => g.id === gameId)

      if (foundGame) {
        console.log(foundGame)
        setGame(foundGame)

        const [yourChamp, enemyChamp] = foundGame.matchupId.split('-vs-')
        setMatchup({
          you: { name: yourChamp, role: 'unknown' },
          enemy: { name: enemyChamp, role: 'unknown' }
        })

        console.log(foundGame)

        const matchupNotes = foundGame.notes.filter((note) => note.type === 'matchup')
        const generalNotes = foundGame.notes.filter((note) => note.type === 'general')

        setNotes(matchupNotes.map((note) => note.content).join('\n'))
        setGeneralInsights(generalNotes.map((note) => note.content).join('\n'))
      }
    } catch (error) {
      console.error('Failed to load game:', error)
    } finally {
      setLoading(false)
    }
  }, [gameId])

  useEffect(() => {
    if (!gameId) return

    loadGame()
  }, [gameId, loadGame])

  const handlePublishReview = async (): Promise<void> => {
    if (!game || !gameId) return

    setSaving(true)
    try {
      await window.api.reviewGame(gameId, {
        matchupNotes: notes,
        generalNotes: generalInsights
      })
      loadGame()
    } catch (error) {
      console.error('Failed to publish review:', error)
      window.alert('Failed to publish review')
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatChampionName = (name: string): string => {
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  const getMatchupTitle = (): string => {
    if (!matchup) return 'Game Review'
    return `${formatChampionName(matchup.you.name)} vs ${formatChampionName(matchup.enemy.name)}`
  }

  if (loading) {
    return (
      <div className="flex flex-col w-full">
        <div className="flex items-center justify-between h-[88px] px-8 bg-[rgba(255,255,255,0.02)] border-b border-[rgba(255,255,255,0.1)]">
          <h1 className="text-2xl font-semibold text-text-primary">Game Review</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-text-secondary">Loading game...</div>
        </div>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="flex flex-col w-full">
        <div className="flex items-center justify-between h-[88px] px-8 bg-[rgba(255,255,255,0.02)] border-b border-[rgba(255,255,255,0.1)]">
          <h1 className="text-2xl font-semibold text-text-primary">Game Review</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-text-secondary">Game not found</div>
        </div>
      </div>
    )
  }

  const isReviewed = game.status === 'reviewed'
  const isCompleted = game.status === 'completed'

  const isDisabled = isReviewed || !isCompleted || saving

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between h-[88px] px-8 bg-[rgba(255,255,255,0.02)] border-b border-[rgba(255,255,255,0.1)]">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-semibold text-text-primary">{getMatchupTitle()}</h1>
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              isReviewed
                ? 'bg-[rgba(0,255,136,0.1)] text-success border border-[rgba(0,255,136,0.3)]'
                : isCompleted
                  ? 'bg-[rgba(255,165,2,0.1)] text-warning border border-[rgba(255,165,2,0.3)]'
                  : 'bg-[rgba(255,255,255,0.05)] text-text-tertiary border border-[rgba(255,255,255,0.1)]'
            }`}
          >
            {game.status}
          </div>
        </div>
        <div className="text-sm text-text-tertiary">{formatDate(game.createdAt)}</div>
      </div>

      <div className="flex-1 p-8 space-y-8">
        <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-text-primary">Matchup Review Notes</h2>
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isDisabled}
            placeholder={
              isCompleted
                ? 'Add matchup-specific notes here (e.g., trading patterns, power spikes, lane dynamics, counterplay strategies)...'
                : 'Complete the game to add matchup notes'
            }
            className={`w-full h-48 px-4 py-3 bg-bg-primary border rounded-lg text-text-primary text-sm resize-none transition-all duration-200 focus:outline-none ${
              isDisabled
                ? 'border-border-secondary cursor-not-allowed opacity-60'
                : 'border-border-secondary focus:border-success focus:bg-bg-primary focus:shadow-[0_0_0_3px_rgba(0,255,136,0.1)]'
            }`}
          />
          <p className="text-xs text-text-tertiary mt-2">
            {isReviewed
              ? 'Game has been reviewed and matchup notes are locked'
              : isCompleted
                ? 'Add matchup-specific insights: trading patterns, power spikes, lane dynamics, counterplay strategies, and what you learned about this champion pairing'
                : 'Complete the game to enable matchup notes'}
          </p>
        </div>

        <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">General Gameplay Insights</h2>
          </div>
          <textarea
            value={generalInsights}
            onChange={(e) => setGeneralInsights(e.target.value)}
            disabled={isDisabled}
            placeholder={
              isCompleted
                ? 'Add general gameplay insights, macro issues, and broader questions here...'
                : 'Complete the game to add general insights'
            }
            className={`w-full h-48 px-4 py-3 bg-bg-primary border rounded-lg text-text-primary text-sm resize-none transition-all duration-200 focus:outline-none ${
              isDisabled
                ? 'border-border-secondary cursor-not-allowed opacity-60'
                : 'border-border-secondary focus:border-success focus:bg-bg-primary focus:shadow-[0_0_0_3px_rgba(0,255,136,0.1)]'
            }`}
          />
          <p className="text-xs text-text-tertiary mt-2">
            {isReviewed
              ? 'Game has been reviewed and general insights are locked'
              : isCompleted
                ? 'Add general gameplay insights, macro issues, and broader questions that apply beyond this matchup'
                : 'Complete the game to enable general insights'}
          </p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handlePublishReview}
            disabled={isDisabled}
            className="px-6 py-3 bg-[rgba(0,255,136,0.1)] border border-[rgba(0,255,136,0.3)] rounded-lg text-success text-sm font-medium transition-all duration-200 hover:bg-[rgba(0,255,136,0.15)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[rgba(0,255,136,0.1)]"
          >
            {saving ? 'Publishing...' : 'Publish Review'}
          </button>
        </div>
      </div>
    </div>
  )
}
