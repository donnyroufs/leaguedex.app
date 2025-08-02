import { type JSX } from 'react'

type Props = {
  gameTime: number | null
}

export function Statusbar({ gameTime }: Props): JSX.Element {
  const ingame = gameTime != null

  return (
    <div className="flex items-center justify-between p-2 bg-gray-900">
      <div className="w-full flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${ingame ? 'bg-green-500' : 'bg-gray-500'}`} />
          <span>{ingame ? 'Match in progress' : 'Waiting for match to start'}</span>
        </div>

        {ingame && (
          <span className="px-3 py-1 text-xs bg-gray-800 text-gray-300 rounded-md font-medium">
            {Math.floor(gameTime / 60)}:{(gameTime % 60).toString().padStart(2, '0')}
          </span>
        )}
      </div>
    </div>
  )
}
