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

  const getCueIcon = (triggerType: ICueDto['triggerType'], size: 'sm' | 'md' = 'sm'): JSX.Element => {
    const cls = size === 'md' ? 'w-5 h-5' : 'w-4 h-4'
    switch (triggerType) {
      case 'interval':
        return <Timer className={`${cls} text-info`} />
      case 'oneTime':
        return <Clock className={`${cls} text-success`} />
      case 'event':
        return <Zap className={`${cls} text-warning`} />
      case 'objective':
        return <Target className={`${cls} text-premium`} />
      default:
        return <Bell className={`${cls} text-neutral`} />
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
        <div className="w-full max-w-5xl mx-auto space-y-10">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-info shadow-[0_0_8px_rgba(0,212,255,0.8)] animate-[statusPulse_2s_infinite]" />
              <h2 className="text-xs font-semibold text-info uppercase tracking-[0.2em]">
                Now Playing
              </h2>
            </div>
            {timeline.current === null ? (
              <div className="border border-dashed border-border-primary rounded-lg bg-bg-secondary/30 px-6 py-8 text-center text-sm text-text-tertiary italic">
                Waiting for next cue…
              </div>
            ) : (
              <div className="relative border-2 border-info rounded-xl bg-gradient-to-br from-info/15 via-info/5 to-transparent p-6 animate-pulse-border overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-info/10 blur-3xl rounded-full pointer-events-none" />
                <div className="relative flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-bg-primary rounded-xl flex items-center justify-center border-2 border-info/40 shadow-lg">
                    {getCueIcon(timeline.current.cue.triggerType, 'md')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold text-info uppercase tracking-wider px-2 py-0.5 rounded bg-info/10 border border-info/30">
                        Live
                      </span>
                      <span className="text-xs text-text-tertiary font-mono">
                        {formatGameTime(timeline.current.triggeredAt)}
                      </span>
                      <span className="text-xs text-text-tertiary">·</span>
                      <span className="text-xs text-text-tertiary">
                        {formatTriggerDisplay(timeline.current.cue)}
                      </span>
                    </div>
                    <p className="text-lg text-text-primary font-semibold leading-snug">
                      {timeline.current.cue.text}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-text-tertiary uppercase tracking-[0.2em]">
                Upcoming
              </h2>
              {timeline.upcoming.length > 0 && (
                <span className="text-xs text-text-tertiary font-mono">
                  {timeline.upcoming.length} queued
                </span>
              )}
            </div>
            {timeline.upcoming.length === 0 ? (
              <div className="text-sm text-text-tertiary italic">No upcoming cues</div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {timeline.upcoming.map((cue, idx) => (
                  <div
                    key={`${cue.id}-upcoming-${idx}`}
                    className="group border border-border-primary rounded-lg bg-bg-secondary/60 p-4 hover:border-info/40 hover:bg-bg-secondary transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-9 h-9 bg-bg-primary rounded-lg flex items-center justify-center border border-border-primary group-hover:border-info/30 transition-colors">
                        {getCueIcon(cue.triggerType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text-primary font-medium line-clamp-2 mb-1">
                          {cue.text}
                        </p>
                        <p className="text-xs text-text-tertiary">{formatTriggerDisplay(cue)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {timeline.past.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold text-text-tertiary uppercase tracking-[0.2em]">
                  History
                </h2>
                <span className="text-xs text-text-tertiary font-mono">
                  {timeline.past.length} played
                </span>
              </div>
              <div className="border border-border-primary/60 rounded-lg bg-bg-secondary/30 divide-y divide-border-primary/40">
                {timeline.past.map((entry, idx) => (
                  <div
                    key={`${entry.cue.id}-${entry.triggeredAt}-${idx}`}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-bg-secondary/60 transition-colors"
                  >
                    <div className="flex-shrink-0">{getCueIcon(entry.cue.triggerType)}</div>
                    <span className="text-xs text-text-tertiary font-mono flex-shrink-0 w-12">
                      {formatGameTime(entry.triggeredAt)}
                    </span>
                    <p className="text-sm text-text-secondary truncate flex-1">{entry.cue.text}</p>
                    <span className="text-xs text-text-tertiary flex-shrink-0 hidden sm:inline">
                      {formatTriggerDisplay(entry.cue)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
