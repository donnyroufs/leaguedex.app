import { JSX, useState } from 'react'
import { Button } from './Button'

type CreateReminderFormProps = {
  onSubmit: (data: { text: string; interval: number }) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function CreateReminderForm({
  onSubmit,
  onCancel,
  isLoading = false
}: CreateReminderFormProps): JSX.Element {
  const [text, setText] = useState<string>('')
  const [interval, setInterval] = useState<string>('')
  const [errors, setErrors] = useState<{ text?: string; interval?: string }>({})

  const validateForm = (): boolean => {
    const newErrors: { text?: string; interval?: string } = {}

    if (!text.trim()) {
      newErrors.text = 'Text is required'
    }

    if (!interval.trim()) {
      newErrors.interval = 'Interval is required'
    } else {
      const intervalNum = Number(interval)
      if (isNaN(intervalNum) || intervalNum < 1) {
        newErrors.interval = 'Interval must be a positive number'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await onSubmit({
        text: text.trim(),
        interval: Number(interval)
      })
    } catch (error) {
      console.error('Failed to create reminder:', error)
    }
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
          placeholder="e.g., Check minimap every 30 seconds"
          className={`w-full px-4 py-3 bg-bg-primary border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-border-accent focus:border-transparent transition-all duration-200 ${
            errors.text ? 'border-status-danger' : 'border-border-primary'
          }`}
        />
        {errors.text && <p className="mt-1 text-sm text-status-danger">{errors.text}</p>}
      </div>

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

      <div className="flex items-center justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading || !text.trim() || !interval.trim()}
        >
          {isLoading ? 'Creating...' : 'Create Reminder'}
        </Button>
      </div>
    </form>
  )
}
