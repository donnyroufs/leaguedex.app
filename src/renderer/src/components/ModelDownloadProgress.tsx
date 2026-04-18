import { useEffect, useState } from 'react'

type Phase = 'downloading' | 'extracting'

type ProgressData = {
  phase: Phase
  receivedBytes: number
  totalBytes: number
}

type Props = {
  isOpen: boolean
}

function formatBytes(bytes: number): string {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let value = bytes
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024
    i++
  }
  return `${value.toFixed(1)} ${units[i]}`
}

export function ModelDownloadProgress({ isOpen }: Props): React.JSX.Element | null {
  const [progress, setProgress] = useState<ProgressData>({
    phase: 'downloading',
    receivedBytes: 0,
    totalBytes: 0
  })

  useEffect(() => {
    if (!isOpen) return
    const unsubscribe = window.api.app.onModelDownloadProgress((data) => setProgress(data))
    return () => unsubscribe()
  }, [isOpen])

  if (!isOpen) return null

  const pct =
    progress.totalBytes > 0 ? Math.round((progress.receivedBytes / progress.totalBytes) * 100) : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-bg-secondary border border-border-primary rounded-lg p-8 w-96 shadow-xl">
        <h2 className="text-xl font-semibold text-text-primary mb-6">
          {progress.phase === 'downloading' ? 'Downloading voice model' : 'Extracting files'}
        </h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">
                {progress.phase === 'downloading'
                  ? `${formatBytes(progress.receivedBytes)} / ${formatBytes(progress.totalBytes) || '?'}`
                  : 'Unpacking archive...'}
              </span>
              {progress.phase === 'downloading' && (
                <span className="text-text-primary font-semibold">{pct}%</span>
              )}
            </div>
            <div className="w-full bg-bg-tertiary rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ease-out rounded-full ${
                  progress.phase === 'extracting' ? 'bg-info animate-pulse w-full' : 'bg-info'
                }`}
                style={
                  progress.phase === 'downloading'
                    ? { width: `${pct}%`, boxShadow: '0 0 10px rgba(0,212,255,0.5)' }
                    : { boxShadow: '0 0 10px rgba(0,212,255,0.5)' }
                }
              />
            </div>
          </div>

          <div className="text-xs text-text-tertiary">
            This is a one-time setup. The model will be saved to your local app data.
          </div>
        </div>
      </div>
    </div>
  )
}
