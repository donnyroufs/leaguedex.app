import { JSX, useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router'

type Game = {
  id: string
  matchupId: string
  createdAt: string
  status: 'in-progress' | 'completed' | 'reviewed'
  notes: {
    id: string
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

        const existingNote = foundGame.notes.find((note) => note.gameId === gameId)
        if (existingNote) {
          setNotes(existingNote.content)
        }
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
      // TODO: Add API call to update game with notes and mark as reviewed
      // This would require new IPC handlers for updating game status and notes
      console.log('Publishing review for game:', gameId, 'with notes:', notes)

      try {
        await window.api.reviewGame(gameId, notes)
        loadGame()
      } catch {
        window.alert('Failed to publish review')
      }

      // For now, we'll simulate the API call
    } catch (error) {
      console.error('Failed to publish review:', error)
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
        <h1 className="text-2xl font-semibold text-text-primary">Game Review</h1>
        <div className="text-sm text-text-tertiary">{formatDate(game.createdAt)}</div>
      </div>

      <div className="flex-1 p-8 space-y-8">
        {matchup && (
          <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Matchup</h2>
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <div className="text-xl font-bold text-success">
                  {formatChampionName(matchup.you.name)}
                </div>
                <div className="text-sm text-text-secondary mt-1">You</div>
              </div>

              <div className="text-text-tertiary text-lg font-medium">vs</div>

              <div className="text-center">
                <div className="text-xl font-bold text-urgent">
                  {formatChampionName(matchup.enemy.name)}
                </div>
                <div className="text-sm text-text-secondary mt-1">Enemy</div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">Review Notes</h2>
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

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isReviewed}
            placeholder={
              isCompleted
                ? 'Add your review notes here...'
                : 'Complete the game to add review notes'
            }
            className={`w-full h-48 px-4 py-3 bg-bg-primary border rounded-lg text-text-primary text-sm resize-none transition-all duration-200 focus:outline-none ${
              isReviewed
                ? 'border-border-secondary cursor-not-allowed opacity-60'
                : 'border-border-secondary focus:border-success focus:bg-bg-primary focus:shadow-[0_0_0_3px_rgba(0,255,136,0.1)]'
            }`}
          />
          <p className="text-xs text-text-tertiary mt-2">
            {isReviewed
              ? 'Game has been reviewed and notes are locked'
              : isCompleted
                ? 'Add notes about your performance, what you learned, and areas for improvement'
                : 'Complete the game to enable review notes'}
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
