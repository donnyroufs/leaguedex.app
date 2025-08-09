import { JSX, useEffect, useState } from 'react'
import { Plus, X, Bell } from 'lucide-react'
import { AddReminderModal } from '../components/AddReminderModal'
import { useModal } from '../hooks'

type Reminder = {
  id: string
  message: string
  triggerTime?: number
  interval?: number
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (minutes === 0) {
    return `${seconds}s`
  } else if (remainingSeconds === 0) {
    return `${minutes}m`
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
}

function formatTimeForDisplay(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (minutes === 0) {
    return `${seconds}s`
  } else if (remainingSeconds === 0) {
    return `${minutes}:00`
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
}

type ReminderCardProps = {
  reminder: Reminder
  onDelete: (id: string) => void
}

function ReminderCard({ reminder, onDelete }: ReminderCardProps): JSX.Element {
  const isRecurring = reminder.interval !== undefined
  const timeValue = reminder.triggerTime ?? reminder.interval ?? 0

  return (
    <div className="group bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-[10px] p-4 transition-all duration-200 relative hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.15)] hover:-translate-y-0.5">
      <div
        className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold transition-opacity duration-200 group-hover:opacity-0 ${
          isRecurring
            ? 'bg-[rgba(0,255,136,0.15)] text-success'
            : 'bg-[rgba(0,212,255,0.15)] text-info'
        }`}
      >
        {isRecurring ? `Every ${formatTime(timeValue)}` : formatTimeForDisplay(timeValue)}
      </div>

      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(reminder.id)
          }}
          className="w-6 h-6 flex items-center justify-center bg-[rgba(255,255,255,0.1)] rounded-[6px] text-text-secondary hover:bg-[rgba(255,71,87,0.2)] hover:text-urgent transition-all duration-200"
        >
          <X size={12} />
        </button>
      </div>

      <div className="pr-16">
        <h3 className="text-base font-semibold text-text-primary leading-tight">
          {reminder.message}
        </h3>
      </div>
    </div>
  )
}

type SectionHeaderProps = {
  title: string
}

function SectionHeader({ title }: SectionHeaderProps): JSX.Element {
  return (
    <div className="col-span-full flex items-center justify-between pb-2 border-b border-[rgba(255,255,255,0.05)] mb-2">
      <span className="text-sm uppercase tracking-wider text-text-tertiary font-medium">
        {title}
      </span>
    </div>
  )
}

type EmptyStateProps = {
  title: string
  subtitle: string
}

function EmptyState({ title, subtitle }: EmptyStateProps): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 bg-[rgba(255,255,255,0.05)] rounded-[16px] flex items-center justify-center mb-6 text-2xl">
        <Bell size={32} className="text-text-tertiary" />
      </div>
      <h3 className="text-lg text-text-secondary mb-2">{title}</h3>
      <p className="text-sm text-text-tertiary max-w-96 mb-6">{subtitle}</p>
    </div>
  )
}

export function RemindersPage(): JSX.Element {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const modal = useModal()

  useEffect(() => {
    window.api.gameAssistant.getReminders().then(setReminders)
  }, [])

  function refreshReminders(): void {
    window.api.gameAssistant.getReminders().then(setReminders)
  }

  async function handleDelete(id: string): Promise<void> {
    try {
      await window.api.gameAssistant.removeReminder(id)
      refreshReminders()
    } catch (err) {
      console.error('Error deleting reminder:', err)
    }
  }

  const oneTimeReminders = reminders.filter((r) => r.triggerTime !== undefined)
  const recurringReminders = reminders.filter((r) => r.interval !== undefined)

  const sortedOneTime = oneTimeReminders.sort((a, b) => (a.triggerTime ?? 0) - (b.triggerTime ?? 0))
  const sortedRecurring = recurringReminders.sort((a, b) => (a.interval ?? 0) - (b.interval ?? 0))

  const hasReminders = reminders.length > 0

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between h-[88px] px-8 bg-[rgba(255,255,255,0.02)] border-b border-[rgba(255,255,255,0.1)]">
        <h1 className="text-2xl font-semibold text-text-primary">Reminders</h1>
        <button
          onClick={modal.onOpen}
          className="flex items-center gap-2 px-6 py-3 bg-[rgba(0,255,136,0.1)] border border-[rgba(0,255,136,0.3)] rounded-lg text-success text-sm font-medium transition-all duration-200 hover:bg-[rgba(0,255,136,0.15)] hover:-translate-y-0.5"
        >
          <Plus size={16} />
          Add Reminder
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {!hasReminders ? (
            <div className="h-full flex items-center justify-center pb-12">
              <EmptyState
                title="No reminders yet"
                subtitle="Create your first reminder to help you stay on top of your game timing and improve your gameplay."
              />
            </div>
          ) : (
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedOneTime.length > 0 && (
                  <>
                    <SectionHeader title="One Time" />
                    {sortedOneTime.map((reminder) => (
                      <ReminderCard key={reminder.id} reminder={reminder} onDelete={handleDelete} />
                    ))}
                  </>
                )}

                {sortedRecurring.length > 0 && (
                  <>
                    <SectionHeader title="Recurring" />
                    {sortedRecurring.map((reminder) => (
                      <ReminderCard key={reminder.id} reminder={reminder} onDelete={handleDelete} />
                    ))}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <AddReminderModal isOpen={modal.isOpen} onClose={modal.onClose} onCreate={refreshReminders} />
    </div>
  )
}
