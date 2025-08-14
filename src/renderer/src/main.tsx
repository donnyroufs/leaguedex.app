import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createHashRouter, RouterProvider } from 'react-router'

import { CurrentMatch } from './pages/CurrentMatch'
import { Layout } from './Layout'
import { Settings } from './pages/Settings'
import { RemindersPage } from './pages/Reminders'
import { Titlebar } from './components/Titlebar'
import { MatchHistory } from './pages/MatchHistory'
import { Game } from './pages/Game'
import { Dex } from './pages/Dex'

const router = createHashRouter([
  {
    element: <Layout />,
    errorElement: (
      <div className="flex flex-col h-screen w-screen">
        <Titlebar title="Leaguedx" />
        <div className="flex-1 flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="mt-4">
            Please try restarting the app. If the problem persists, please contact support.
          </p>
        </div>
      </div>
    ),
    children: [
      {
        index: true,
        path: '/',
        element: <Dex />
      },
      {
        index: false,
        path: '/match',
        element: <CurrentMatch />
      },
      {
        path: '/settings',
        element: <Settings />
      },
      {
        path: '/reminders',
        element: <RemindersPage />
      },
      {
        path: '/match-history',
        element: <MatchHistory />
      },
      {
        path: '/game/:gameId',
        element: <Game />
      }
    ]
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
