import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createHashRouter, RouterProvider } from 'react-router'
import { Toaster } from 'react-hot-toast'

import { Layout } from './Layout'
import { Settings } from './pages/Settings'
import { RemindersPage } from './pages/Reminders'
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
        path: '/settings',
        element: <Settings />,
        loader: async () => {
          const license = await window.api.app.getLicense()
          return { license }
        }
      },
      {
        path: '/',
        element: <RemindersPage />,
        loader: async () => {
          const reminders = await window.api.app.getReminders()
          return { reminders }
        }
      }
    ]
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#0f1624',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        },
        success: {
          iconTheme: {
            primary: '#00ff88',
            secondary: '#ffffff'
          }
        },
        error: {
          iconTheme: {
            primary: '#ff4757',
            secondary: '#ffffff'
          }
        }
      }}
    />
  </StrictMode>
)
