import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createHashRouter, RouterProvider } from 'react-router'

import { Matchups } from './pages/Matchups'
import { Layout } from './Layout'
import { Settings } from './pages/Settings'
import { Titlebar } from './components/Titlebar'

const router = createHashRouter([
  {
    element: <Layout />,
    errorElement: (
      <div className="flex flex-col h-screen w-screen">
        <Titlebar title="Leaguedex" />
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
        element: <Matchups />
      },
      {
        path: '/settings',
        element: <Settings />
      }
    ]
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
