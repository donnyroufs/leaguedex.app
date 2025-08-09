import { JSX, useEffect, useState } from 'react'
import { Outlet } from 'react-router'

import { Statusbar } from './components/Statusbar'
import { Titlebar } from './components/Titlebar'
import { SidebarNavItem } from './components/SidebarNavItem'
import { Layers, Settings as SettingsIcon, Bell } from 'lucide-react'

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

export function Layout(): JSX.Element {
  const [gameTime, setGameTime] = useState<number | null>(null)
  const [matchup, setMatchup] = useState<Matchup | null>(null)

  useEffect(() => {
    const unsubscribe = window.api.gameAssistant.onGameData((data) => {
      setGameTime(data.gameTime)
      setMatchup(data.matchup)
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
          <p className="px-4 pb-2 text-xs uppercase tracking-wide text-text-tertiary">Your Data</p>
          <nav>
            <ul className="flex flex-col mt-2">
              <li>
                <SidebarNavItem to="/" label="Match" icon={Layers} />
              </li>
              <li>
                <SidebarNavItem to="/reminders" label="Reminders" icon={Bell} />
              </li>
              <li>
                <SidebarNavItem to="/settings" label="Settings" icon={SettingsIcon} />
              </li>
            </ul>
          </nav>
        </aside>
        <main className="flex-1 flex flex-col overflow-hidden">
          <Outlet context={{ matchup }} />
        </main>
      </div>
    </div>
  )
}
