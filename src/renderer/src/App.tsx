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
      <Titlebar title="Leaguedex" />
      <Statusbar gameTime={gameTime} />

      <div className="flex-1 p-4">
        <h1 className="text-3xl font-bold underline">Hello world!</h1>
      </div>
    </div>
  )
}

export default App
