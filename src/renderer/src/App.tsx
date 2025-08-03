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
    <div className="h-screen flex flex-col bg-bg-primary">
      <header>
        <Titlebar title="Leaguedex" />
        <Statusbar gameTime={gameTime} />
      </header>

      <div className="flex-1 flex bg-gradient-to-br from-bg-primary to-bg-secondary">
        <aside className="w-60 bg-bg-tertiary backdrop-blur-md border-r border-border-primary flex flex-col pt-6">
          {/* Sidebar content will go here */}
        </aside>
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Main content will go here */}
        </main>
        <aside className="w-80 bg-[rgba(255,255,255,0.02)] border-l border-border-primary relative">
          <Reminders />
        </aside>
      </div>
    </div>
  )
}

export default App
