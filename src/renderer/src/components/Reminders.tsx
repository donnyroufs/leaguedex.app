/**
 * This component is responsible for display the USER reminders,
 * and creating / deleting them.
 */

import { useEffect, useState, type JSX } from 'react'

type Reminder = {
  id: string
  message: string
  triggerTime?: number
  interval?: number
}

export function Reminders(): JSX.Element {
  const [reminders, setReminders] = useState<Reminder[]>([])

  useEffect(() => {
    window.api.gameAssistant.getReminders().then((x) => {
      console.log(x)
      setReminders(x)
    })
  }, [])

  const getReminderFrequency = (reminder: Reminder): string => {
    if (reminder.interval) {
      return `Every ${reminder.interval}s`
    }
    if (reminder.triggerTime) {
      const minutes = Math.floor(reminder.triggerTime / 60)
      const seconds = reminder.triggerTime % 60
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }
    return 'One time'
  }

  return (
    <div className="p-6">
      <div className="max-w-md mx-auto space-y-4">
        {/* Reminder Cards */}
        {reminders.map((reminder) => (
          <div
            key={reminder.id}
            className="bg-slate-700 rounded-lg p-4 flex items-center space-x-3"
          >
            {/* Message */}
            <div className="flex-1">
              <p className="text-white font-medium">{reminder.message}</p>
            </div>

            {/* Frequency/Time */}
            <div className="text-white text-sm">{getReminderFrequency(reminder)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
