import { JSX, useEffect, useState } from 'react'
import { Bell, Clock, Zap, Target, Timer } from 'lucide-react'
import { PageWrapper } from '../components/PageWrapper'
import { EmptyState } from '@renderer/components/EmptyState'
import { useLoaderData } from 'react-router'
import { CueTimelineDto, ICueDto } from '@contracts'

export function CueViewerPage(): JSX.Element {
  const initialTimeline = useLoaderData<CueTimelineDto>()
  const [timeline, setTimeline] = useState<CueTimelineDto>(initialTimeline)

  useEffect(() => {
    const unsubscribe = window.api.app.onCueTimelineUpdated((data) => {
      setTimeline(data)
    })

    return () => unsubscribe()
  }, [])

  const getCueIcon = (triggerType: ICueDto['triggerType']): JSX.Element => {
    switch (triggerType) {
      case 'interval':
        return <Timer className="w-4 h-4 text-info" />
      case 'oneTime':
        return <Clock className="w-4 h-4 text-success" />
      case 'event':
        return <Zap className="w-4 h-4 text-warning" />
      case 'objective':
        return <Target className="w-4 h-4 text-premium" />
      default:
        return <Bell className="w-4 h-4 text-neutral" />
    }
  }

  const formatTriggerDisplay = (cue: ICueDto): JSX.Element | string => {
    if (cue.triggerType === 'interval' && cue.interval) {
      return `Every ${cue.interval}s`
    }

    if (cue.triggerType === 'oneTime' && cue.triggerAt) {
      const minutes = Math.floor(cue.triggerAt / 60)
      const seconds = cue.triggerAt % 60
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }

    if (cue.triggerType === 'event' && cue.event) {
      switch (cue.event) {
        case 'canon-wave-spawned':
          return 'Canon wave'
        case 'respawn':
          return 'On respawn'
        case 'mana-changed':
          return cue.value !== undefined ? `Mana ≤ ${cue.value}` : 'Mana'
        case 'gold-threshold':
          return cue.value !== undefined ? `Gold ≥ ${cue.value}` : 'Gold'
        case 'support-item-upgraded':
          return 'Support item'
        default:
          return `${cue.event}`
      }
    }

    if (cue.triggerType === 'objective' && cue.objective && cue.beforeObjective) {
      const objectiveName = cue.objective.charAt(0).toUpperCase() + cue.objective.slice(1)
      return `${cue.beforeObjective}s before ${objectiveName}`
    }

    return 'Unknown'
  }

  const formatGameTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const hasNoCues =
    timeline.past.length === 0 && timeline.current === null && timeline.upcoming.length === 0

  if (hasNoCues) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center h-full">
          <EmptyState
            title="No cues available"
            subtitle="Activate a pack to see cues during games"
            icon={<Bell size={32} className="text-text-tertiary" />}
          />
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="flex items-center justify-between h-20 p-8 border-b border-border-primary">
        <h1 className="text-2xl font-semibold text-text-primary">In-Game</h1>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 p-8">
        <div className="w-full max-w-5xl mx-auto space-y-8">
          <section>
            <h2 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-4">
              Past Cues
            </h2>
            {timeline.past.length === 0 ? (
              <div className="text-sm text-text-tertiary italic">No cues played yet</div>
            ) : (
              <div className="grid gap-3 md:grid-cols-3">
                {timeline.past.map((entry, idx) => (
                  <div
                    key={`${entry.cue.id}-${entry.triggeredAt}-${idx}`}
                    className="border border-border-primary/50 rounded-lg bg-bg-secondary/50 p-4 opacity-60 hover:opacity-80 transition-opacity"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-shrink-0 w-8 h-8 bg-bg-primary rounded-lg flex items-center justify-center border border-border-primary/20">
                        {getCueIcon(entry.cue.triggerType)}
                      </div>
                      <span className="text-xs text-text-tertiary">
                        {formatGameTime(entry.triggeredAt)}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary font-medium line-clamp-2">
                      {entry.cue.text}
                    </p>
                    <p className="text-xs text-text-tertiary mt-1">
                      {formatTriggerDisplay(entry.cue)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-4">
              Now Playing
            </h2>
            {timeline.current === null ? (
              <div className="text-sm text-text-tertiary italic">No cue playing</div>
            ) : (
              <div className="grid gap-3 md:grid-cols-3">
                <div className="border-2 border-info rounded-lg bg-gradient-to-br from-info/10 to-info/5 p-4 animate-pulse-border">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-shrink-0 w-8 h-8 bg-bg-primary rounded-lg flex items-center justify-center border-2 border-info/30">
                      {getCueIcon(timeline.current.cue.triggerType)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-info uppercase tracking-wider">
                        Playing
                      </span>
                      <span className="text-xs text-text-tertiary">
                        {formatGameTime(timeline.current.triggeredAt)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-text-primary font-semibold mb-1 line-clamp-2">
                    {timeline.current.cue.text}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {formatTriggerDisplay(timeline.current.cue)}
                  </p>
                </div>
              </div>
            )}
          </section>

          <section>
            <h2 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-4">
              Upcoming
            </h2>
            {timeline.upcoming.length === 0 ? (
              <div className="text-sm text-text-tertiary italic">No upcoming cues</div>
            ) : (
              <div className="grid gap-3 md:grid-cols-3">
                {timeline.upcoming.map((cue, idx) => (
                  <div
                    key={`${cue.id}-upcoming-${idx}`}
                    className="border-2 border-border-primary rounded-lg bg-bg-secondary p-4 hover:border-info/30 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-shrink-0 w-8 h-8 bg-bg-primary rounded-lg flex items-center justify-center border border-border-primary/20">
                        {getCueIcon(cue.triggerType)}
                      </div>
                      <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                        Next
                      </span>
                    </div>
                    <p className="text-sm text-text-primary font-medium line-clamp-2 mb-1">
                      {cue.text}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      {formatTriggerDisplay(cue)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </PageWrapper>
  )
}
