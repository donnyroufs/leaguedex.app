/**
 * This component is responsible for display the USER reminders,
 * and creating / deleting them.
 */

import { useEffect, useState, type JSX } from 'react'
import { Eye, MapPin, Plus } from 'lucide-react'

type Reminder = {
  id: string
  message: string
  triggerTime?: number
  interval?: number
}

export function Reminders(): JSX.Element {
  const [reminders, setReminders] = useState<Reminder[]>([])

  useEffect(() => {
    window.api.gameAssistant.getReminders().then(setReminders)
  }, [])

  const sortedReminders = reminders.toSorted((a, b) => {
    if (a.triggerTime || b.triggerTime) {
      return (a.triggerTime ?? 0) - (b.triggerTime ?? 0)
    }

    return (a.interval ?? 0) - (b.interval ?? 0)
  })

  return (
    <div className="flex flex-col h-full">
      {/* Panel Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Reminder Items */}
        <div className="space-y-3">
          {sortedReminders.map((reminder) => (
            <div
              key={reminder.id}
              className="flex items-center gap-4 p-4 bg-[rgba(0,255,136,0.05)] border border-[rgba(0,255,136,0.2)] rounded-md"
            >
              <div className="w-8 h-8 bg-[rgba(0,255,136,0.1)] rounded-sm flex items-center justify-center">
                {reminder.interval ? (
                  <Eye size={16} className="text-success" />
                ) : (
                  <MapPin size={16} className="text-success" />
                )}
              </div>
              <div className="flex-1 text-sm text-text-primary">{reminder.message}</div>
              <div className="text-xs text-text-tertiary">
                {reminder.interval
                  ? `Every ${reminder.interval}s`
                  : `At ${Math.floor(reminder.triggerTime! / 60)}:${String(reminder.triggerTime! % 60).padStart(2, '0')}`}
              </div>
            </div>
          ))}
        </div>

        <button
          disabled
          className="w-full p-4 mt-6 bg-[rgba(0,255,136,0.1)] border border-[rgba(0,255,136,0.3)] rounded-md text-success text-sm cursor-pointer transition-all duration-200 hover:bg-[rgba(0,255,136,0.15)] flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          Add Reminder
        </button>
      </div>
    </div>
  )
}
