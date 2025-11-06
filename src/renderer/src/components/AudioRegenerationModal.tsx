import { useEffect, useState } from 'react'

interface AudioRegenerationModalProps {
  isOpen: boolean
}

interface ProgressData {
  completedPacks: number
  totalPacks: number
  completedCues: number
  totalUniqueCues: number
}

export function AudioRegenerationModal({
  isOpen
}: AudioRegenerationModalProps): React.JSX.Element | null {
  const [progress, setProgress] = useState<ProgressData>({
    completedPacks: 0,
    totalPacks: 0,
    completedCues: 0,
    totalUniqueCues: 0
  })

  useEffect(() => {
    if (!isOpen) return

    const unsubscribeProgress = window.api.app.onRegenerateProgress((data) => {
      setProgress(data)
    })

    return () => {
      unsubscribeProgress()
    }
  }, [isOpen])

  if (!isOpen) return null

  const percentage =
    progress.totalUniqueCues > 0
      ? Math.round((progress.completedCues / progress.totalUniqueCues) * 100)
      : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-background-secondary border border-border-primary rounded-lg p-8 w-96 shadow-xl">
        <h2 className="text-xl font-semibold text-text-primary mb-6">Regenerating Audio Files</h2>

        <div className="space-y-4">
          {/* Pack Progress */}
          <div className="text-sm text-text-secondary">
            Processing pack {progress.completedPacks} of {progress.totalPacks}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">
                {progress.completedCues} / {progress.totalUniqueCues} cues
              </span>
              <span className="text-text-primary font-semibold">{percentage}%</span>
            </div>
            <div className="w-full bg-bg-tertiary rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-info transition-all duration-300 ease-out rounded-full shadow-[0_0_10px_rgba(0,212,255,0.5)]"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Info message */}
          <div className="text-xs text-text-tertiary mt-4">
            Please wait while we regenerate all your audio files. This may take a few moments.
          </div>
        </div>
      </div>
    </div>
  )
}
