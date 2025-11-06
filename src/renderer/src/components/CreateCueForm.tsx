import { JSX, useState } from 'react'
import { Button } from './Button'
import { Timer, Clock, Zap, Target } from 'lucide-react'
import { CreateCueDto } from '@contracts'
import { TimeInput } from './TimeInput'

type CreateCueFormProps = {
  onSubmit: (data: CreateCueDto) => Promise<void>
  onCancel: () => void
  activePackId: string
  isLoading?: boolean
}

export function CreateCueForm({
  onSubmit,
  onCancel,
  activePackId,
  isLoading = false
}: CreateCueFormProps): JSX.Element {
  const [text, setText] = useState('')
  const [triggerType, setTriggerType] = useState<'interval' | 'oneTime' | 'event' | 'objective'>(
    'interval'
  )
  const [interval, setInterval] = useState<string>('')
  const [triggerAt, setTriggerAt] = useState<string>('')
  const [event, setEvent] = useState<string>('')
  const [eventValue, setEventValue] = useState<string>('')
  const [objective, setObjective] = useState<'dragon' | 'baron' | 'grubs' | 'herald' | 'atakhan'>(
    'dragon'
  )
  const [beforeObjective, setBeforeObjective] = useState<string>('')
  const [endTime, setEndTime] = useState<string>('')

  // Add toggle states for MM:ss mode
  const [useMMSSInterval, setUseMMSSInterval] = useState(true)
  const [useMMSSTriggerAt, setUseMMSSTriggerAt] = useState(true)
  const [useMMSSBeforeObjective, setUseMMSSBeforeObjective] = useState(true)
  const [useMMSSEndTime, setUseMMSSEndTime] = useState(true)

  const [errors, setErrors] = useState<{
    text?: string
    interval?: string
    triggerAt?: string
    event?: string
    eventValue?: string
    objective?: string
    beforeObjective?: string
    endTime?: string
  }>({})

  const mmssToSeconds = (mmss: string): number | null => {
    const parts = mmss.split(':')
    if (parts.length !== 2) return null
    const mins = parseInt(parts[0], 10)
    const secs = parseInt(parts[1], 10)
    if (isNaN(mins) || isNaN(secs)) return null
    return mins * 60 + secs
  }

  // Helper to parse input value based on mode
  const parseToSeconds = (value: string, isMMSS: boolean): number | null => {
    if (!value.trim()) return null
    if (isMMSS) {
      return mmssToSeconds(value)
    }
    return Number(value)
  }

  const getTriggerTypeIcon = (type: string): JSX.Element => {
    switch (type) {
      case 'interval':
        return <Timer className="w-5 h-5" />
      case 'oneTime':
        return <Clock className="w-5 h-5" />
      case 'event':
        return <Zap className="w-5 h-5" />
      case 'objective':
        return <Target className="w-5 h-5" />
      default:
        return <Timer className="w-5 h-5" />
    }
  }

  const getTriggerTypeColor = (type: string): string => {
    switch (type) {
      case 'interval':
        return 'text-info'
      case 'oneTime':
        return 'text-success'
      case 'event':
        return 'text-warning'
      case 'objective':
        return 'text-premium'
      default:
        return 'text-info'
    }
  }

  const validateForm = (): boolean => {
    const newErrors: {
      text?: string
      interval?: string
      triggerAt?: string
      event?: string
      eventValue?: string
      objective?: string
      beforeObjective?: string
      endTime?: string
    } = {}

    if (!text.trim()) {
      newErrors.text = 'Text is required'
    }

    if (triggerType === 'interval') {
      if (!interval.trim()) {
        newErrors.interval = 'Interval is required'
      } else {
        const intervalNum = parseToSeconds(interval, useMMSSInterval)
        if (intervalNum === null || isNaN(intervalNum) || intervalNum < 1) {
          newErrors.interval = useMMSSInterval
            ? 'Interval must be in MM:ss format and positive'
            : 'Interval must be a positive number'
        }
      }
    }

    if (triggerType === 'oneTime') {
      if (!triggerAt.trim()) {
        newErrors.triggerAt = 'Trigger time is required'
      } else {
        const triggerAtNum = parseToSeconds(triggerAt, useMMSSTriggerAt)
        if (triggerAtNum === null || isNaN(triggerAtNum) || triggerAtNum < 0) {
          newErrors.triggerAt = useMMSSTriggerAt
            ? 'Trigger time must be in MM:ss format'
            : 'Trigger time must be a non-negative number'
        }
      }
    }

    if (triggerType === 'event') {
      if (!event.trim()) {
        newErrors.event = 'Event is required'
      }
      if (event === 'mana-changed') {
        if (!eventValue.trim()) {
          newErrors.eventValue = 'Mana threshold is required'
        } else {
          const eventValueNum = Number(eventValue)
          if (isNaN(eventValueNum) || eventValueNum < 0) {
            newErrors.eventValue = 'Mana threshold must be a non-negative number'
          }
        }
      }
    }

    if (triggerType === 'objective') {
      if (!beforeObjective.trim()) {
        newErrors.beforeObjective = 'Time before objective is required'
      } else {
        const beforeObjectiveNum = parseToSeconds(beforeObjective, useMMSSBeforeObjective)
        if (beforeObjectiveNum === null || isNaN(beforeObjectiveNum) || beforeObjectiveNum < 0) {
          newErrors.beforeObjective = useMMSSBeforeObjective
            ? 'Time before objective must be in MM:ss format'
            : 'Time before objective must be a non-negative number'
        }
      }
    }

    if (endTime.trim()) {
      const endTimeNum = parseToSeconds(endTime, useMMSSEndTime)
      if (endTimeNum === null || isNaN(endTimeNum) || endTimeNum < 1) {
        newErrors.endTime = useMMSSEndTime
          ? 'End time must be in MM:ss format and positive'
          : 'End time must be a positive number'
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

    const formData: CreateCueDto = {
      text: text.trim(),
      triggerType,
      packId: activePackId
    }

    if (triggerType === 'interval') {
      const intervalNum = parseToSeconds(interval, useMMSSInterval)
      if (intervalNum !== null) {
        formData.interval = intervalNum
      }
    } else if (triggerType === 'oneTime') {
      const triggerAtNum = parseToSeconds(triggerAt, useMMSSTriggerAt)
      if (triggerAtNum !== null) {
        formData.triggerAt = triggerAtNum
      }
    } else if (triggerType === 'event') {
      formData.event = event.trim()
      if (event === 'mana-changed' && eventValue.trim()) {
        const eventValueNum = Number(eventValue)
        if (!isNaN(eventValueNum)) {
          formData.value = eventValueNum
        }
      }
    } else if (triggerType === 'objective') {
      formData.objective = objective
      const beforeObjectiveNum = parseToSeconds(beforeObjective, useMMSSBeforeObjective)
      if (beforeObjectiveNum !== null) {
        formData.beforeObjective = beforeObjectiveNum
      }
    }

    if (endTime.trim()) {
      const endTimeNum = parseToSeconds(endTime, useMMSSEndTime)
      if (endTimeNum !== null && endTimeNum > 0) {
        formData.endTime = endTimeNum
      }
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
      if (event === 'mana-changed') {
        return Boolean(text.trim() && event.trim() && eventValue.trim())
      }
      return Boolean(text.trim() && event.trim())
    }
    if (triggerType === 'objective') {
      return Boolean(text.trim() && beforeObjective.trim())
    }
    return false
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Cue Text Section - Full Width */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-text-primary">Cue Details</h3>
          <p className="text-sm text-text-tertiary mt-1">What should this cue say?</p>
        </div>

        <div>
          <input
            id="cue-text"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g., Check minimap, Ward pixel brush, Stack tear..."
            className={`w-full px-4 py-3.5 bg-bg-primary border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-info/20 focus:border-info/40 transition-all duration-200 ${
              errors.text ? 'border-status-danger' : 'border-border-primary'
            }`}
          />
          {errors.text && <p className="mt-2.5 text-sm text-status-danger">{errors.text}</p>}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column - Trigger Type Selection */}
        <div className="lg:col-span-1 space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-text-primary">Trigger Type</h3>
            <p className="text-sm text-text-tertiary mt-1">When should this cue activate?</p>
          </div>

          <div className="space-y-3">
            {[
              {
                value: 'interval',
                label: 'Every Interval',
                icon: 'interval',
                description: 'Repeats at regular intervals'
              },
              {
                value: 'oneTime',
                label: 'At specific time',
                icon: 'oneTime',
                description: 'Triggers once at a set time'
              },
              {
                value: 'event',
                label: 'On specific event',
                icon: 'event',
                description: 'Activates when an event occurs'
              },
              {
                value: 'objective',
                label: 'Before objective',
                icon: 'objective',
                description: 'Warns before objectives spawn'
              }
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setTriggerType(option.value as 'interval' | 'oneTime' | 'event' | 'objective')
                }
                className={`w-full p-4 rounded-lg border transition-all duration-200 text-left ${
                  triggerType === option.value
                    ? 'border-info/40 bg-info/5 ring-2 ring-info/20'
                    : 'border-border-primary bg-bg-primary hover:border-border-accent hover:bg-bg-tertiary'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      triggerType === option.value ? 'bg-info/10' : 'bg-bg-secondary'
                    }`}
                  >
                    <div className={getTriggerTypeColor(option.icon)}>
                      {getTriggerTypeIcon(option.icon)}
                    </div>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-semibold text-text-primary">{option.label}</div>
                    <div className="text-xs text-text-tertiary mt-1.5">{option.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column - Dynamic Form Fields */}
        <div className="lg:col-span-2 space-y-5">
          {triggerType === 'interval' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">Interval Settings</h3>
                <p className="text-sm text-text-tertiary">How often should this cue repeat?</p>
              </div>

              <TimeInput
                id="cue-interval"
                label="Interval"
                value={interval}
                onChange={setInterval}
                error={errors.interval}
                placeholder={useMMSSInterval ? '1:30' : '90'}
                useMMSS={useMMSSInterval}
                onToggleMMSS={() => setUseMMSSInterval(!useMMSSInterval)}
              />
            </div>
          )}

          {triggerType === 'oneTime' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">Timing Settings</h3>
                <p className="text-sm text-text-tertiary">When exactly should this cue trigger?</p>
              </div>

              <TimeInput
                id="cue-trigger-time"
                label="Trigger Time"
                value={triggerAt}
                onChange={setTriggerAt}
                error={errors.triggerAt}
                placeholder={useMMSSTriggerAt ? '2:30' : '150'}
                useMMSS={useMMSSTriggerAt}
                onToggleMMSS={() => setUseMMSSTriggerAt(!useMMSSTriggerAt)}
              />
            </div>
          )}

          {triggerType === 'event' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">Event Settings</h3>
                <p className="text-sm text-text-tertiary">What event should trigger this cue?</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="cue-event"
                    className="block text-sm font-medium text-text-primary mb-2"
                  >
                    Event
                  </label>
                  <select
                    id="cue-event"
                    value={event}
                    onChange={(e) => setEvent(e.target.value)}
                    className="w-full px-4 py-3 bg-bg-primary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-warning/20 focus:border-warning/40 transition-all duration-200"
                  >
                    <option value="">Select an event</option>
                    <option value="respawn">Player respawn</option>
                    <option value="canon-wave-spawned">Canon wave spawned</option>
                    <option value="mana-changed">Mana changed</option>
                    <option value="support-item-upgraded">Support item upgraded</option>
                  </select>
                  {errors.event && (
                    <p className="mt-2 text-sm text-status-danger">{errors.event}</p>
                  )}
                </div>

                {event === 'mana-changed' && (
                  <div>
                    <label
                      htmlFor="cue-event-value"
                      className="block text-sm font-medium text-text-primary mb-2"
                    >
                      Mana Threshold
                    </label>
                    <input
                      id="cue-event-value"
                      type="number"
                      min="0"
                      value={eventValue}
                      onChange={(e) => setEventValue(e.target.value)}
                      placeholder="e.g., 100"
                      className={`w-full px-4 py-3 bg-bg-primary border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-warning/20 focus:border-warning/40 transition-all duration-200 ${
                        errors.eventValue ? 'border-status-danger' : 'border-border-primary'
                      }`}
                    />
                    <p className="mt-1.5 text-xs text-text-tertiary">
                      The cue will trigger when mana is at or below this value
                    </p>
                    {errors.eventValue && (
                      <p className="mt-2 text-sm text-status-danger">{errors.eventValue}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {triggerType === 'objective' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">Objective Settings</h3>
                <p className="text-sm text-text-tertiary">
                  Which objective and when should this cue trigger?
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="cue-objective"
                    className="block text-sm font-medium text-text-primary mb-2"
                  >
                    Objective
                  </label>
                  <select
                    id="cue-objective"
                    value={objective}
                    onChange={(e) =>
                      setObjective(
                        e.target.value as 'dragon' | 'baron' | 'grubs' | 'herald' | 'atakhan'
                      )
                    }
                    className="w-full px-4 py-3 bg-bg-primary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-premium/20 focus:border-premium/40 transition-all duration-200"
                  >
                    <option value="dragon">Dragon</option>
                    <option value="baron">Baron</option>
                    <option value="grubs">Grubs</option>
                    <option value="herald">Herald</option>
                    <option value="atakhan">Atakhan</option>
                  </select>
                </div>

                <TimeInput
                  id="cue-before-objective"
                  label="Time Before Spawn"
                  value={beforeObjective}
                  onChange={setBeforeObjective}
                  error={errors.beforeObjective}
                  placeholder={useMMSSBeforeObjective ? '0:30' : '30'}
                  useMMSS={useMMSSBeforeObjective}
                  onToggleMMSS={() => setUseMMSSBeforeObjective(!useMMSSBeforeObjective)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-text-primary">End Time (Optional)</h3>
          <p className="text-sm text-text-tertiary mt-1">
            When should this cue stop triggering? Leave empty if it should continue indefinitely.
          </p>
        </div>

        <TimeInput
          id="cue-end-time"
          label="End Time"
          value={endTime}
          onChange={setEndTime}
          error={errors.endTime}
          placeholder={useMMSSEndTime ? '20:00' : '1200'}
          useMMSS={useMMSSEndTime}
          onToggleMMSS={() => setUseMMSSEndTime(!useMMSSEndTime)}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-border-primary/20">
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
          {isLoading ? 'Creating...' : 'Create Cue'}
        </Button>
      </div>
    </form>
  )
}
