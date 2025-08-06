/**
 * This component is responsible for display the USER reminders,
 * and creating / deleting them.
 */

import { useEffect, useState, type JSX } from 'react'
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
  const modal = useModal()

  useEffect(() => {
    window.api.gameAssistant.getReminders().then(setReminders)
  }, [])

  function onCreate(): void {
    window.api.gameAssistant.getReminders().then(setReminders)
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

        <AddReminderModal {...modal} onCreate={onCreate} />
      </div>
    </div>
  )
}
