import { JSX } from 'react'
import Markdown, { Components } from 'react-markdown'
import { useOutletContext } from 'react-router'
import { PageWrapper } from '../components/PageWrapper'
import { formatDistanceToNow } from 'date-fns'

type Matchup = {
  id: string
  you: {
    name: string
    role: string
    team: 'blue' | 'red'
  }
  enemy: {
    name: string
    role: string
    team: 'blue' | 'red'
  }
}

const markdownComponents = {
  h1: ({ children }: { children: React.ReactNode }) => (
    <h1 className="text-xl font-bold text-accent-green mb-3 mt-5">{children}</h1>
  ),
  h2: ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-lg font-semibold text-accent-green mb-2 mt-4">{children}</h2>
  ),
  h3: ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-base font-medium text-accent-green mb-2 mt-3">{children}</h3>
  ),
  h4: ({ children }: { children: React.ReactNode }) => (
    <h4 className="text-sm font-medium text-accent-green mb-1 mt-2">{children}</h4>
  ),
  h5: ({ children }: { children: React.ReactNode }) => (
    <h5 className="text-xs font-medium text-accent-green mb-1 mt-2">{children}</h5>
  ),
  h6: ({ children }: { children: React.ReactNode }) => (
    <h6 className="text-xs font-medium text-accent-green mb-1 mt-2">{children}</h6>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li className="text-text-secondary list-disc list-inside">{children}</li>
  )
}

export function CurrentMatch(): JSX.Element {
  const ctx = useOutletContext<{
    matchup: Matchup | null
    insights: string | null
    totalPlayed: number
    lastPlayed: Date | null
  }>()

  if (ctx.matchup === null) {
    return (
      <PageWrapper>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-text-secondary text-lg mb-2">No active match found</div>
            <div className="text-text-tertiary text-sm">
              Start a League of Legends match to see champion analysis
            </div>
          </div>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <header className="relative h-40 overflow-hidden border-b border-border-primary bg-bg-secondary flex-shrink-0">
        <div className="inset-0 flex">
          <div className="flex-1 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-blue-950/15 to-slate-900/30 z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/90 via-bg-primary/40 to-transparent z-20" />

            <div className="absolute top-6 left-6 z-30">
              <div className="text-xs uppercase tracking-wider text-blue-400/80 font-semibold mb-1">
                {ctx.matchup.you.team === 'blue' ? 'Your Pick' : 'Enemy Pick'}
              </div>
              <div className="text-2xl font-bold text-text-primary">
                {ctx.matchup.you.team === 'blue' ? ctx.matchup.you.name : ctx.matchup.enemy.name}
              </div>
              <div className="text-sm text-text-secondary capitalize mt-1">
                {ctx.matchup.you.team === 'blue' ? ctx.matchup.you.role : ctx.matchup.enemy.role}
              </div>
            </div>

            <img
              src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${ctx.matchup.you.team === 'blue' ? ctx.matchup.you.name : ctx.matchup.enemy.name}_0.jpg`}
              alt={ctx.matchup.you.team === 'blue' ? ctx.matchup.you.name : ctx.matchup.enemy.name}
              className="w-full h-full object-cover object-top opacity-70"
            />
          </div>

          <div className="absolute inset-0 flex items-center justify-center z-40">
            <div className="absolute inset-y-0 left-1/2 transform -translate-x-px">
              <div className="w-px h-full bg-border-primary"></div>
            </div>
            <div className="bg-bg-primary/90 backdrop-blur-md border border-border-primary rounded-full h-14 w-14 flex items-center justify-center shadow-2xl shadow-black/50">
              <span className="text-text-primary font-semibold text-sm uppercase tracking-wider">
                VS
              </span>
            </div>
          </div>

          <div className="flex-1 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-bl from-red-900/20 via-red-950/15 to-slate-900/30 z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/90 via-bg-primary/40 to-transparent z-20" />

            <div className="absolute top-6 right-6 z-30 text-right">
              <div className="text-xs uppercase tracking-wider text-red-400/80 font-semibold mb-1">
                {ctx.matchup.you.team === 'red' ? 'Your Pick' : 'Enemy Pick'}
              </div>
              <div className="text-2xl font-bold text-text-primary">
                {ctx.matchup.you.team === 'red' ? ctx.matchup.you.name : ctx.matchup.enemy.name}
              </div>
              <div className="text-sm text-text-secondary capitalize mt-1">
                {ctx.matchup.you.team === 'red' ? ctx.matchup.you.role : ctx.matchup.enemy.role}
              </div>
            </div>

            <img
              src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${ctx.matchup.you.team === 'red' ? ctx.matchup.you.name : ctx.matchup.enemy.name}_0.jpg`}
              alt={ctx.matchup.you.team === 'red' ? ctx.matchup.you.name : ctx.matchup.enemy.name}
              className="w-full h-full object-cover object-top opacity-70"
            />
          </div>
        </div>
      </header>
      <div className="bg-gray-800/50 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Games:</span>
                <span className="text-white font-medium">{ctx.totalPlayed}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Last Played:</span>
                <span className="text-gray-300">
                  {ctx.lastPlayed
                    ? formatDistanceToNow(ctx.lastPlayed, {
                        addSuffix: true
                      })
                    : 'Never'}
                </span>
              </div>
            </div>
            <button className="text-gray-400 hover:text-white transition-colors">
              View Full History
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0 space-y-4 p-4">
        <div className="rounded-lg border border-border-primary bg-bg-secondary p-4">
          <div className="text-text-primary font-semibold text-lg border-b border-border-primary pb-2 mb-3">
            Insights
          </div>
          <div className="text-text-secondary">
            <Markdown components={markdownComponents as Components}>
              {ctx.insights ?? 'No insights available'}
            </Markdown>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
