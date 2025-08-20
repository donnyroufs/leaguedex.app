import { JSX, useState } from 'react'
import { Button } from './Button'

type CreateReminderFormProps = {
  onSubmit: (data: {
    text: string
    triggerType: 'interval' | 'oneTime'
    interval?: number
    triggerAt?: number
  }) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function CreateReminderForm({
  onSubmit,
  onCancel,
  isLoading = false
}: CreateReminderFormProps): JSX.Element {
  const [text, setText] = useState<string>('')
  const [triggerType, setTriggerType] = useState<'interval' | 'oneTime'>('interval')
  const [interval, setInterval] = useState<string>('')
  const [triggerAt, setTriggerAt] = useState<string>('')
  const [errors, setErrors] = useState<{ text?: string; interval?: string; triggerAt?: string }>({})

  const validateForm = (): boolean => {
    const newErrors: { text?: string; interval?: string; triggerAt?: string } = {}

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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (formEvent: React.FormEvent): Promise<void> => {
    formEvent.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      const submitData: {
        text: string
        triggerType: 'interval' | 'oneTime'
        interval?: number
        triggerAt?: number
      } = {
        text: text.trim(),
        triggerType
      }

      if (triggerType === 'interval') {
        submitData.interval = Number(interval)
      } else if (triggerType === 'oneTime') {
        submitData.triggerAt = Number(triggerAt)
      }

      await onSubmit(submitData)
    } catch (error) {
      console.error('Failed to create reminder:', error)
    }
  }

  const isFormValid = (): boolean => {
    if (triggerType === 'interval') {
      return Boolean(text.trim() && interval.trim())
    } else if (triggerType === 'oneTime') {
      return Boolean(text.trim() && triggerAt.trim())
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
          onChange={(e) => setTriggerType(e.target.value as 'interval' | 'oneTime')}
          className="w-full px-4 py-3 bg-bg-primary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-border-accent focus:border-transparent transition-all duration-200"
        >
          <option value="interval">Every X seconds</option>
          <option value="oneTime">At specific time</option>
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
            min="1"
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
            placeholder="30"
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
            htmlFor="reminder-trigger-at"
            className="block text-sm font-medium text-text-primary mb-2"
          >
            Trigger At (seconds)
          </label>
          <input
            id="reminder-trigger-at"
            type="number"
            min="0"
            value={triggerAt}
            onChange={(e) => setTriggerAt(e.target.value)}
            placeholder="150"
            className={`w-full px-4 py-3 bg-bg-primary border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-border-accent focus:border-transparent transition-all duration-200 ${
              errors.triggerAt ? 'border-status-danger' : 'border-border-primary'
            }`}
          />
          {errors.triggerAt && (
            <p className="mt-1 text-sm text-status-danger">{errors.triggerAt}</p>
          )}
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading || !isFormValid()}>
          {isLoading ? 'Creating...' : 'Create Reminder'}
        </Button>
      </div>
    </form>
  )
}
