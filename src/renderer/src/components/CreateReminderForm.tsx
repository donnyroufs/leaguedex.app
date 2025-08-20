import { JSX, useState } from 'react'
import { Button } from './Button'

type CreateReminderFormProps = {
  onSubmit: (data: {
    text: string
    triggerType: 'interval' | 'oneTime' | 'event'
    interval?: number
    triggerAt?: number
    event?: string
  }) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function CreateReminderForm({
  onSubmit,
  onCancel,
  isLoading = false
}: CreateReminderFormProps): JSX.Element {
  const [text, setText] = useState('')
  const [triggerType, setTriggerType] = useState<'interval' | 'oneTime' | 'event'>('interval')
  const [interval, setInterval] = useState<string>('')
  const [triggerAt, setTriggerAt] = useState<string>('')
  const [event, setEvent] = useState<string>('')
  const [errors, setErrors] = useState<{
    text?: string
    interval?: string
    triggerAt?: string
    event?: string
  }>({})

  const validateForm = (): boolean => {
    const newErrors: {
      text?: string
      interval?: string
      triggerAt?: string
      event?: string
    } = {}

    if (!text.trim()) {
      newErrors.text = 'Text is required'
    }

    if (triggerType === 'interval') {
      if (!interval.trim()) {
        newErrors.interval = 'Interval is required'
      } else {
        const intervalNum = Number(interval)
        if (isNaN(intervalNum) || intervalNum < 1) {
          newErrors.interval = 'Interval must be a positive number'
        }
      }
    }

    if (triggerType === 'oneTime') {
      if (!triggerAt.trim()) {
        newErrors.triggerAt = 'Trigger time is required'
      } else {
        const triggerAtNum = Number(triggerAt)
        if (isNaN(triggerAtNum) || triggerAtNum < 0) {
          newErrors.triggerAt = 'Trigger time must be a non-negative number'
        }
      }
    }

    if (triggerType === 'event') {
      if (!event.trim()) {
        newErrors.event = 'Event is required'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (formEvent: React.FormEvent): Promise<void> => {
    formEvent.preventDefault()

    if (!validateForm()) {
      return
    }

    // @ts-expect-error we need to fix shared contracts
    const formData: CreateReminderDto = {
      text: text.trim(),
      triggerType
    }

    if (triggerType === 'interval') {
      formData.interval = Number(interval)
    } else if (triggerType === 'oneTime') {
      formData.triggerAt = Number(triggerAt)
    } else if (triggerType === 'event') {
      formData.event = event.trim()
    }

    await onSubmit(formData)
  }

  const isFormValid = (): boolean => {
    if (triggerType === 'interval') {
      return Boolean(text.trim() && interval.trim())
    }
    if (triggerType === 'oneTime') {
      return Boolean(text.trim() && triggerAt.trim())
    }
    if (triggerType === 'event') {
      return Boolean(text.trim() && event.trim())
    }
    return false
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="reminder-text" className="block text-sm font-medium text-text-primary mb-2">
          Reminder Text
        </label>
        <input
          id="reminder-text"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g., Check minimap"
          className={`w-full px-4 py-3 bg-bg-primary border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-border-accent focus:border-transparent transition-all duration-200 ${
            errors.text ? 'border-status-danger' : 'border-border-primary'
          }`}
        />
        {errors.text && <p className="mt-1 text-sm text-status-danger">{errors.text}</p>}
      </div>

      <div>
        <label
          htmlFor="reminder-trigger-type"
          className="block text-sm font-medium text-text-primary mb-2"
        >
          Trigger Type
        </label>
        <select
          id="reminder-trigger-type"
          value={triggerType}
          onChange={(e) => setTriggerType(e.target.value as 'interval' | 'oneTime' | 'event')}
          className="w-full px-4 py-3 bg-bg-primary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-border-accent focus:border-transparent transition-all duration-200"
        >
          <option value="interval">Every X seconds</option>
          <option value="oneTime">At specific time</option>
          <option value="event">On specific event</option>
        </select>
      </div>

      {triggerType === 'interval' && (
        <div>
          <label
            htmlFor="reminder-interval"
            className="block text-sm font-medium text-text-primary mb-2"
          >
            Interval (seconds)
          </label>
          <input
            id="reminder-interval"
            type="number"
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
            placeholder="60"
            min="1"
            className={`w-full px-4 py-3 bg-bg-primary border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-border-accent focus:border-transparent transition-all duration-200 ${
              errors.interval ? 'border-status-danger' : 'border-border-primary'
            }`}
          />
          {errors.interval && <p className="mt-1 text-sm text-status-danger">{errors.interval}</p>}
        </div>
      )}

      {triggerType === 'oneTime' && (
        <div>
          <label
            htmlFor="reminder-trigger-time"
            className="block text-sm font-medium text-text-primary mb-2"
          >
            Trigger Time (seconds)
          </label>
          <input
            id="reminder-trigger-time"
            type="number"
            value={triggerAt}
            onChange={(e) => setTriggerAt(e.target.value)}
            placeholder="150"
            min="0"
            className={`w-full px-4 py-3 bg-bg-primary border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-border-accent focus:border-transparent transition-all duration-200 ${
              errors.triggerAt ? 'border-status-danger' : 'border-border-primary'
            }`}
          />
          {errors.triggerAt && (
            <p className="mt-1 text-sm text-status-danger">{errors.triggerAt}</p>
          )}
        </div>
      )}

      {triggerType === 'event' && (
        <div>
          <label
            htmlFor="reminder-event"
            className="block text-sm font-medium text-text-primary mb-2"
          >
            Event
          </label>
          <select
            id="reminder-event"
            value={event}
            onChange={(e) => setEvent(e.target.value)}
            className="w-full px-4 py-3 bg-bg-primary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-border-accent focus:border-transparent transition-all duration-200"
          >
            <option value="">Select an event</option>
            <option value="respawn">Player respawn</option>
            {/* Add more events here as they become available */}
          </select>
          {errors.event && <p className="mt-1 text-sm text-status-danger">{errors.event}</p>}
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={!isFormValid() || isLoading} className="flex-1">
          {isLoading ? 'Creating...' : 'Create Reminder'}
        </Button>
      </div>
    </form>
  )
}
