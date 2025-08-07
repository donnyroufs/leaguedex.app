/**
 * This component is responsible for display the USER reminders,
 * and creating / deleting them.
 */

import { useEffect, useState, useRef, type JSX } from 'react'
import { Eye, MapPin } from 'lucide-react'
import { AddReminderModal } from './AddReminderModal'
import { useModal } from '../hooks'

type Reminder = {
  id: string
  message: string
  triggerTime?: number
  interval?: number
}

export function Reminders(): JSX.Element {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [heldReminder, setHeldReminder] = useState<string | null>(null)
  const [holdProgress, setHoldProgress] = useState(0)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const modal = useModal()

  const HOLD_DURATION = 1000 // 1 second to hold

  useEffect(() => {
    window.api.gameAssistant.getReminders().then(setReminders)
  }, [])

  function onCreate(): void {
    window.api.gameAssistant.getReminders().then(setReminders)
  }

  async function onDelete(id: string): Promise<void> {
    try {
      await window.api.gameAssistant.removeReminder(id)
      await window.api.gameAssistant.getReminders().then(setReminders)
    } catch (err) {
      console.error('Error deleting reminder:', err)
      return
    }
  }

  function handleMouseDown(id: string): void {
    setHeldReminder(id)
    setHoldProgress(0)

    // Start progress animation
    const startTime = Date.now()
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min((elapsed / HOLD_DURATION) * 100, 100)
      setHoldProgress(progress)

      if (progress >= 100) {
        clearInterval(progressIntervalRef.current!)
        onDelete(id)
        setHeldReminder(null)
        setHoldProgress(0)
      }
    }, 16) // ~60fps
  }

  function handleMouseUp(): void {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
    setHeldReminder(null)
    setHoldProgress(0)
  }

  function handleMouseLeave(): void {
    handleMouseUp()
  }

  const sortedReminders = reminders.toSorted((a, b) => {
    if (a.triggerTime || b.triggerTime) {
      return (a.triggerTime ?? 0) - (b.triggerTime ?? 0)
    }

    return (a.interval ?? 0) - (b.interval ?? 0)
  })

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 overflow-y-auto">
        {sortedReminders.length <= 0 && (
          <div className="p-4 border border-[rgba(0,255,136,0.2)] rounded-md text-text-tertiary">
            <p>You have not yet configured any reminders!</p>
          </div>
        )}
        <div className="space-y-3">
          {sortedReminders.map((reminder) => {
            const isHeld = heldReminder === reminder.id
            const progress = isHeld ? holdProgress : 0

            return (
              <div
                key={reminder.id}
                onMouseDown={() => handleMouseDown(reminder.id)}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onTouchStart={() => handleMouseDown(reminder.id)}
                onTouchEnd={handleMouseUp}
                className="group flex items-center gap-4 p-4 bg-[rgba(0,255,136,0.05)] border border-[rgba(0,255,136,0.2)] rounded-md hover:bg-[rgba(255,71,87,0.05)] hover:border-[rgba(255,71,87,0.2)] transition-all duration-200 cursor-pointer relative"
              >
                <div className="w-8 h-8 bg-[rgba(0,255,136,0.1)] group-hover:bg-[rgba(255,71,87,0.1)] rounded-sm flex items-center justify-center transition-colors duration-200 relative">
                  {reminder.interval ? (
                    <Eye
                      size={16}
                      className="text-success group-hover:text-urgent transition-colors duration-200"
                    />
                  ) : (
                    <MapPin
                      size={16}
                      className="text-success group-hover:text-urgent transition-colors duration-200"
                    />
                  )}

                  {/* Progress Spinner */}
                  {isHeld && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
                        {/* Background circle */}
                        <circle
                          cx="16"
                          cy="16"
                          r="14"
                          stroke="rgba(255,71,87,0.2)"
                          strokeWidth="2"
                          fill="none"
                        />
                        {/* Progress circle */}
                        <circle
                          cx="16"
                          cy="16"
                          r="14"
                          stroke="rgba(255,71,87,0.8)"
                          strokeWidth="2"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 14}`}
                          strokeDashoffset={`${2 * Math.PI * 14 * (1 - progress / 100)}`}
                          className="transition-all duration-100 ease-out"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex-1 text-sm text-text-primary">{reminder.message}</div>
                <div className="text-xs text-text-tertiary">
                  {reminder.interval
                    ? `Every ${reminder.interval}s`
                    : `At ${Math.floor(reminder.triggerTime! / 60)}:${String(reminder.triggerTime! % 60).padStart(2, '0')}`}
                </div>
              </div>
            )
          })}
        </div>

        <AddReminderModal {...modal} onCreate={onCreate} />
      </div>
    </div>
  )
}
