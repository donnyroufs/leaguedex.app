import { type JSX } from 'react'

type Props = {
  /**
   * Game time in seconds
   */
  gameTime: number | null
}

function formatGameTime(gameTime: number): string {
  const minutes = Math.floor(gameTime / 60)
  const seconds = Math.floor(gameTime % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function Statusbar({ gameTime }: Props): JSX.Element {
  const ingame = gameTime != null

  return (
    <div className="h-10 bg-[rgba(0,255,136,0.03)] border-t border-b border-[rgba(0,255,136,0.15)] flex items-center px-8 gap-4">
      <div className="flex items-center gap-4">
        <div
          className={`w-2 h-2 rounded-full ${ingame ? 'bg-success shadow-[0_0_10px_rgba(0,255,136,0.8)] animate-[statusPulse_2s_infinite]' : 'bg-text-tertiary'}`}
        ></div>
        <span
          className={`text-sm font-semibold ${ingame ? 'text-success' : 'text-text-secondary'}`}
        >
          {ingame ? 'IN GAME' : 'NOT IN GAME'}
        </span>
      </div>

      {ingame && (
        <>
          <span className="text-text-secondary text-sm">•</span>
          <span className="text-sm text-text-secondary font-medium">
            {formatGameTime(gameTime!)}
          </span>
        </>
      )}
    </div>
  )
}
