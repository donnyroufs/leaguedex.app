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
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export function Statusbar({ gameTime }: Props): JSX.Element {
  const ingame = gameTime != null

  return (
    <div className="flex items-center justify-between p-2 bg-status-in-game border-2 border-[#14232A] h-10">
      <div className="w-full flex items-center text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${ingame ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}
          />
          <span className="font-bold text-green-500">
            {ingame ? 'IN-GAME' : 'You are not in a game'}
          </span>
        </div>

        {ingame && (
          <>
            <span className="mx-2 text-text-secondary">•</span>
            <span className="py-1 text-md rounded-md font-medium">{formatGameTime(gameTime!)}</span>
          </>
        )}
      </div>
    </div>
  )
}
