import { BarChartIcon } from 'lucide-react'
import { JSX, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { PageWrapper } from '../components/PageWrapper'

type GameData = {
  id: string
  matchupId: string
  createdAt: string
  status: 'in-progress' | 'completed' | 'reviewed'
  notes: unknown[]
}

type MatchHistoryItem = {
  id: string
  matchupId: string
  yourChampion: string
  enemyChampion: string
  yourRole: string
  createdAt: Date
  status: 'in-progress' | 'completed' | 'reviewed'
  needsReview: boolean
}

function parseMatchupId(matchupId: string): {
  yourChampion: string
  enemyChampion: string
  yourRole: string
} {
  const [youPart, enemyPart] = matchupId.split('-vs-')
  const [champion, role] = youPart?.split('-') || ['Unknown', 'Unknown']
  const [enemyChampion] = enemyPart?.split('-') || ['Unknown']
  return {
    yourChampion: champion || 'Unknown',
    enemyChampion: enemyChampion || 'Unknown',
    yourRole: role || 'Unknown'
  }
}

function transformGameToHistoryItem(game: GameData): MatchHistoryItem {
  const { yourChampion, enemyChampion } = parseMatchupId(game.matchupId)

  return {
    id: game.id,
    matchupId: game.matchupId,
    yourChampion: yourChampion.charAt(0).toUpperCase() + yourChampion.slice(1),
    enemyChampion: enemyChampion.charAt(0).toUpperCase() + enemyChampion.slice(1),
    yourRole: 'Unknown',
    createdAt: new Date(game.createdAt),
    status: game.status,
    needsReview: game.status === 'completed'
  }
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`

  return date.toLocaleDateString()
}

function getStatusColor(status: 'in-progress' | 'completed' | 'reviewed'): string {
  switch (status) {
    case 'in-progress':
      return 'bg-[rgba(0,255,136,0.15)] text-success'
    case 'completed':
      return 'bg-[rgba(0,212,255,0.15)] text-info'
    case 'reviewed':
      return 'bg-[rgba(255,255,255,0.1)] text-text-secondary'
  }
}

function getStatusText(status: 'in-progress' | 'completed' | 'reviewed'): string {
  switch (status) {
    case 'in-progress':
      return 'In Progress'
    case 'completed':
      return 'Completed'
    case 'reviewed':
      return 'Reviewed'
  }
}

type MatchRowProps = {
  match: MatchHistoryItem
}

function MatchRow({ match }: MatchRowProps): JSX.Element {
  const navigate = useNavigate()

  function onNavigate(): void {
    navigate(`/game/${match.id}`)
  }

  return (
    <div
      className="group bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.08)] rounded-[10px] p-4 transition-all duration-200 hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.15)] hover:-translate-y-0.5 cursor-pointer"
      onClick={onNavigate}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-text-primary">{match.yourChampion}</span>
            <span className="text-xs text-text-tertiary">vs</span>
            <span className="text-sm font-medium text-text-primary">{match.enemyChampion}</span>
          </div>

          {match.needsReview && (
            <div className="px-2 py-1 bg-[rgba(255,165,2,0.15)] rounded-[6px] text-xs font-semibold text-warning">
              Needs Review
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(match.status)}`}
          >
            {getStatusText(match.status)}
          </div>

          <span className="text-xs text-text-tertiary min-w-[80px] text-right">
            {formatRelativeTime(match.createdAt)}
          </span>
        </div>
      </div>
    </div>
  )
}

type EmptyStateProps = {
  title: string
  subtitle: string
}

function EmptyState({ title, subtitle }: EmptyStateProps): JSX.Element {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-12 h-12 bg-[rgba(255,255,255,0.05)] rounded-[10px] flex items-center justify-center mb-4">
        <BarChartIcon className="text-text-tertiary text-xl" />
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-secondary max-w-[300px]">{subtitle}</p>
    </div>
  )
}

type GroupedMatches = {
  today: MatchHistoryItem[]
  earlier: MatchHistoryItem[]
}

function isToday(date: Date): boolean {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

function groupAndSortMatches(matches: MatchHistoryItem[]): GroupedMatches {
  const sortedMatches = [...matches].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  return sortedMatches.reduce(
    (groups, match) => {
      if (isToday(match.createdAt)) {
        groups.today.push(match)
      } else {
        groups.earlier.push(match)
      }
      return groups
    },
    { today: [], earlier: [] } as GroupedMatches
  )
}

type MatchGroupProps = {
  title: string
  matches: MatchHistoryItem[]
}

function MatchGroup({ title, matches }: MatchGroupProps): JSX.Element {
  if (matches.length === 0) return <></>

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider px-1">
        {title}
      </h2>
      <div className="space-y-3">
        {matches.map((match) => (
          <MatchRow key={match.id} match={match} />
        ))}
      </div>
    </div>
  )
}

export function MatchHistory(): JSX.Element {
  const [matches, setMatches] = useState<MatchHistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadMatches(): Promise<void> {
      try {
        const games = await window.api.getGames()
        const historyItems = games.map(transformGameToHistoryItem)
        setMatches(historyItems)
      } catch (error) {
        console.error('Failed to load match history:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMatches()
  }, [])

  const hasMatches = matches.length > 0
  const groupedMatches = groupAndSortMatches(matches)

  return (
    <PageWrapper>
      <div className="flex items-center justify-between h-[88px] px-8 bg-[rgba(255,255,255,0.02)] border-b border-[rgba(255,255,255,0.1)] flex-shrink-0">
        <h1 className="text-2xl font-semibold text-text-primary">Match History</h1>
        {hasMatches && (
          <span className="text-sm text-text-secondary">
            {matches.length} match{matches.length !== 1 ? 'es' : ''}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-text-secondary">Loading matches...</div>
          </div>
        ) : !hasMatches ? (
          <div className="h-full flex items-center justify-center pb-12">
            <EmptyState
              title="No matches yet"
              subtitle="Your match history will appear here once you start playing games. Each match will be tracked automatically."
            />
          </div>
        ) : (
          <div className="p-8 space-y-8">
            <MatchGroup title="Today" matches={groupedMatches.today} />
            <MatchGroup title="Earlier" matches={groupedMatches.earlier} />
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
