import { JSX } from 'react'

export function Matchups(): JSX.Element {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Matchups</h1>
        <p className="text-sm text-text-secondary">
          This is the matchups page, where you can see the matchups for the current game.
        </p>
      </div>
    </div>
  )
}
