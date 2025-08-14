import { JSX } from 'react'

interface ChampionCardProps {
  name: string
  title: string
  imageUrl: string
  isActive: boolean
  onClick: () => void
}

export function ChampionCard({
  name,
  title,
  imageUrl,
  isActive,
  onClick
}: ChampionCardProps): JSX.Element {
  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden rounded-lg border transition-all duration-200 ${
        isActive
          ? 'border-border-accent bg-bg-secondary hover:bg-bg-tertiary cursor-pointer'
          : 'border-border-secondary bg-bg-secondary/50 opacity-60 cursor-not-allowed'
      }`}
      disabled={!isActive}
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={imageUrl}
          alt={name}
          className={`w-full h-full object-cover transition-transform duration-300 ${
            isActive ? 'group-hover:scale-110' : ''
          }`}
        />
      </div>

      <div className="p-3 bg-bg-secondary/80 backdrop-blur-sm">
        <h3 className="font-semibold text-text-primary text-sm truncate">{name}</h3>
        <p className="text-text-tertiary text-xs truncate">{title}</p>
      </div>

      {isActive && (
        <div className="absolute top-2 right-2 w-3 h-3 bg-status-success rounded-full animate-pulse" />
      )}

      {!isActive && (
        <div className="absolute inset-0 bg-bg-primary/20 backdrop-blur-sm flex items-center justify-center">
          <span className="text-text-tertiary text-xs font-medium">No Matchup</span>
        </div>
      )}
    </button>
  )
}
