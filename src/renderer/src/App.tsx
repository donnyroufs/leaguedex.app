import { useEffect, useState } from 'react'
import { Statusbar } from './components/Statusbar'
import { Titlebar } from './components/Titlebar'
import { Reminders } from './components/Reminders'

function App(): React.JSX.Element {
  const [gameTime, setGameTime] = useState<number | null>(null)

  useEffect(() => {
    const unsubscribe = window.api.gameAssistant.onGameData((data) => {
      setGameTime(data.gameTime)
    })

    return () => unsubscribe()
  }, [])

  return (
    <div className="h-screen flex flex-col">
      <header>
        <Titlebar title="Leaguedex" />
        <Statusbar gameTime={gameTime} />
      </header>

      <div className="flex-1 flex">
        <aside className="bg-background-secondary flex-1 min-w-[330px]"></aside>
        <main className="bg-background-primary flex-3"></main>
        <aside className="bg-background-secondary flex-1 min-w-[330px]">
          <Reminders />
        </aside>
      </div>
    </div>
  )
}

export default App
