import { JSX, useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation } from 'react-router'

import { Statusbar } from './components/Statusbar'
import { Titlebar } from './components/Titlebar'
import { Reminders } from './components/Reminders'
import { SidebarNavItem } from './components/SidebarNavItem'
import { Layers, Settings as SettingsIcon } from 'lucide-react'

export function Layout(): JSX.Element {
  const [gameTime, setGameTime] = useState<number | null>(null)
  const location = useLocation()

  useEffect(() => {
    const unsubscribe = window.api.gameAssistant.onGameData((data) => {
      setGameTime(data.gameTime)
    })

    return () => unsubscribe()
  }, [])

  const sidebar = useMemo(() => {
    if (location.pathname === '/settings') {
      return null
    }

    return <Reminders />
  }, [location.pathname])

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
                <SidebarNavItem to="/" label="Matchups" icon={Layers} />
              </li>
              <li>
                <SidebarNavItem to="/settings" label="Settings" icon={SettingsIcon} />
              </li>
            </ul>
          </nav>
        </aside>
        <main className="flex-1 flex flex-col overflow-hidden p-8">
          <Outlet />
        </main>
        {sidebar && <aside className="w-80 bg-[rgba(255,255,255,0.02)] relative">{sidebar}</aside>}
      </div>
    </div>
  )
}
