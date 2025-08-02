import { useEffect, useState } from 'react'
import { Statusbar } from './components/Statusbar'
import { Titlebar } from './components/Titlebar'

function App(): React.JSX.Element {
  const [gameTime, setGameTime] = useState<number | null>(null)

  useEffect(() => {
    const interval = setInterval(async () => {
      const result = await window.api.gameDetector.detect()
      setGameTime(result)
    }, 1_000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="h-screen flex flex-col">
      <header>
        <Titlebar title="Leaguedex" />
        <Statusbar gameTime={gameTime} />
      </header>

      <div className="flex-1 flex">
        <aside className="bg-background-secondary flex-1">nav</aside>
        <main className="bg-background-primary flex-3">main content</main>
        <aside className="bg-background-secondary flex-1">sidebar</aside>
      </div>
    </div>
  )
}

export default App
