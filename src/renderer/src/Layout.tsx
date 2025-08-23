import { JSX, useEffect, useState } from 'react'
import { Outlet } from 'react-router'

import { Statusbar } from './components/Statusbar'
import { Titlebar } from './components/Titlebar'
import { SidebarNavItem } from './components/SidebarNavItem'
import { Settings as SettingsIcon, Bell, Download, RefreshCw } from 'lucide-react'
import { Contracts } from 'src/main/shared-kernel'

type UpdateStatus = {
  status: 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error'
  version?: string
  releaseDate?: string
  progress?: number
  error?: string
}

export type AppContext = {
  gameData: Contracts.GameDataDto | null
}

export function Layout(): JSX.Element {
  const [version, setVersion] = useState<string | null>(null)
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus | null>(null)
  const [isCheckingUpdates, setIsCheckingUpdates] = useState<boolean>(false)
  const [gameData, setGameData] = useState<Contracts.GameDataDto | null>(null)

  useEffect(() => {
    window.api?.getVersion?.().then((version) => setVersion(version))
  }, [])

  useEffect(() => {
    const unsubscribe = window.api.app.onGameData((data) => {
      setGameData(data)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const unsubscribe = window.api.updater.onUpdateStatus((data) => {
      setUpdateStatus(data)
    })

    return () => unsubscribe()
  }, [])

  const handleCheckForUpdates = async (): Promise<void> => {
    try {
      setIsCheckingUpdates(true)
      await window.api.updater.checkForUpdates()
    } catch (error) {
      console.error('Failed to check for updates:', error)
    } finally {
      setIsCheckingUpdates(false)
    }
  }

  const handleDownloadUpdate = async (): Promise<void> => {
    try {
      await window.api.updater.downloadUpdate()
    } catch (error) {
      console.error('Failed to download update:', error)
    }
  }

  const handleInstallUpdate = async (): Promise<void> => {
    try {
      await window.api.updater.installUpdate()
    } catch (error) {
      console.error('Failed to install update:', error)
    }
  }

  const getUpdateButton = (): JSX.Element | null => {
    if (!updateStatus) return null

    switch (updateStatus.status) {
      case 'available':
        return (
          <button
            onClick={handleDownloadUpdate}
            className="flex items-center gap-2 px-3 py-2 text-xs bg-bg-tertiary hover:bg-bg-secondary text-text-accent border border-border-accent rounded transition-colors"
          >
            <Download className="w-3 h-3" />
            Update Available
          </button>
        )
      case 'downloading':
        return (
          <div className="flex items-center gap-2 px-3 py-2 text-xs text-text-accent">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Downloading... {updateStatus.progress?.toFixed(1)}%
          </div>
        )
      case 'downloaded':
        return (
          <button
            onClick={handleInstallUpdate}
            className="flex items-center gap-2 px-3 py-2 text-xs bg-bg-tertiary hover:bg-bg-secondary text-status-success border border-status-success rounded transition-colors"
          >
            <Download className="w-3 h-3" />
            Install Update
          </button>
        )
      case 'error':
        return (
          <div className="flex items-center gap-2 px-3 py-2 text-xs text-status-danger">
            <span>Update Error</span>
          </div>
        )
      default:
        return null
    }
  }

  const ctx: AppContext = {
    gameData
  }

  return (
    <div className="w-full h-full flex flex-col bg-bg-primary" style={{ height: '100vh' }}>
      <header className="flex-shrink-0">
        <Titlebar title="Leaguedex" />
        <Statusbar gameTime={gameData?.time ?? null} />
      </header>

      <div className="flex-1 flex bg-gradient-to-br from-bg-primary to-bg-secondary min-h-0">
        <aside className="w-60 bg-bg-tertiary backdrop-blur-md border-r border-border-primary flex flex-col pt-6 flex-shrink-0">
          <p className="px-4 pb-2 text-xs uppercase tracking-wide text-text-tertiary">Your Data</p>
          <nav>
            <ul className="flex flex-col mt-2">
              <li>
                <SidebarNavItem to="/" label="Reminders" icon={Bell} />
              </li>
              <li>
                <SidebarNavItem to="/settings" label="Settings" icon={SettingsIcon} />
              </li>
            </ul>
          </nav>
          <div className="mt-auto p-4 border-t border-border-primary bg-bg-primary">
            <div className="flex flex-col gap-2">
              {getUpdateButton()}
              <button
                onClick={handleCheckForUpdates}
                disabled={isCheckingUpdates}
                className="flex items-center justify-center gap-2 px-3 py-2 text-xs bg-bg-secondary hover:bg-bg-tertiary text-text-primary rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-3 h-3 ${isCheckingUpdates ? 'animate-spin' : ''}`} />
                {isCheckingUpdates ? 'Checking...' : `Check for Updates (v${version || '...'})`}
              </button>
            </div>
          </div>
        </aside>
        <main className="flex-1 flex flex-col overflow-hidden min-h-0">
          <Outlet context={ctx} />
        </main>
      </div>
    </div>
  )
}
