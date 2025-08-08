import { JSX } from 'react'
import { useOutletContext } from 'react-router'

type Matchup = {
  you: {
    championName: string
    role: string
    team: 'blue' | 'red'
  }
  enemy: {
    championName: string
    role: string
    team: 'blue' | 'red'
  }
}

export function CurrentMatch(): JSX.Element {
  const ctx = useOutletContext<{ matchup: Matchup | null }>()

  if (ctx.matchup === null) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-text-secondary text-lg mb-2">No active match found</div>
          <div className="text-text-tertiary text-sm">
            Start a League of Legends match to see champion analysis
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1">
      <header className="relative h-40 overflow-hidden border-b border-border-primary bg-bg-secondary">
        <div className="inset-0 flex">
          <div className="flex-1 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-blue-950/15 to-slate-900/30 z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/90 via-bg-primary/40 to-transparent z-20" />

            <div className="absolute top-6 left-6 z-30">
              <div className="text-xs uppercase tracking-wider text-blue-400/80 font-semibold mb-1">
                {ctx.matchup.you.team === 'blue' ? 'Your Pick' : 'Enemy Pick'}
              </div>
              <div className="text-2xl font-bold text-text-primary">
                {ctx.matchup.you.team === 'blue'
                  ? ctx.matchup.you.championName
                  : ctx.matchup.enemy.championName}
              </div>
              <div className="text-sm text-text-secondary capitalize mt-1">
                {ctx.matchup.you.team === 'blue' ? ctx.matchup.you.role : ctx.matchup.enemy.role}
              </div>
            </div>

            <img
              src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${ctx.matchup.you.team === 'blue' ? ctx.matchup.you.championName : ctx.matchup.enemy.championName}_0.jpg`}
              alt={
                ctx.matchup.you.team === 'blue'
                  ? ctx.matchup.you.championName
                  : ctx.matchup.enemy.championName
              }
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
                {ctx.matchup.you.team === 'red'
                  ? ctx.matchup.you.championName
                  : ctx.matchup.enemy.championName}
              </div>
              <div className="text-sm text-text-secondary capitalize mt-1">
                {ctx.matchup.you.team === 'red' ? ctx.matchup.you.role : ctx.matchup.enemy.role}
              </div>
            </div>

            <img
              src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${ctx.matchup.you.team === 'red' ? ctx.matchup.you.championName : ctx.matchup.enemy.championName}_0.jpg`}
              alt={
                ctx.matchup.you.team === 'red'
                  ? ctx.matchup.you.championName
                  : ctx.matchup.enemy.championName
              }
              className="w-full h-full object-cover object-top opacity-70"
            />
          </div>
        </div>
      </header>
      {/* <div className="bg-bg-secondary py-4 border-b border-border-primary"></div> */}
    </div>
  )
}
