import React from 'react'

type TitlebarProps = {
  title?: string
  version: string | null
}

export const Titlebar: React.FC<TitlebarProps> = ({ title, version }) => {
  const handleMinimize = (): void => {
    window.api?.minimizeWindow?.()
  }

  const handleMaximize = (): void => {
    window.api?.maximizeWindow?.()
  }

  const handleClose = (): void => {
    window.api?.closeWindow?.()
  }

  return (
    <div
      className="titlebar bg-background-secondary text-text-primary h-8 flex items-center justify-between select-none"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <div className="flex-1 flex items-center px-4 cursor-default">
        <svg
          width="16"
          height="16"
          viewBox="0 0 196 193"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M127.818 63.9331L114.588 91.0092C114.314 91.5691 114.317 92.2244 114.596 92.7817L163.857 191.305C164.196 191.982 164.889 192.41 165.646 192.41H192.756C194.245 192.41 195.212 190.842 194.543 189.512L131.402 63.9129C130.659 62.4346 128.545 62.4466 127.818 63.9331Z"
            fill="#27909D"
          />
          <path
            d="M119.009 166.971L131.282 192.199C131.329 192.297 131.258 192.41 131.15 192.41H3.23607C1.7493 192.41 0.782315 190.846 1.44722 189.516L94.4558 3.49856C95.1855 2.03927 97.2613 2.02057 98.0172 3.46648L112.246 30.6865C112.542 31.2539 112.549 31.9291 112.265 32.5026L47.4745 162.957C46.8142 164.286 47.7813 165.846 49.2657 165.846H117.21C117.976 165.846 118.674 166.283 119.009 166.971Z"
            fill="#E2E2E2"
          />
        </svg>
        <span className="text-sm font-medium ml-3">{title}</span>
        {version && <span className="text-xs text-text-tertiary ml-2">v{version} beta</span>}
      </div>

      <div
        className="flex items-center"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <button
          onClick={handleMinimize}
          className="w-12 h-8 flex items-center justify-center hover:bg-gray-700 transition-colors"
          title="Minimize"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <button
          onClick={handleMaximize}
          className="w-12 h-8 flex items-center justify-center hover:bg-gray-700 transition-colors"
          title="Maximize"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <button
          onClick={handleClose}
          className="w-12 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
          title="Close"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
