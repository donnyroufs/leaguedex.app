import { JSX, useState } from 'react'
import { Button } from './Button'
import { CreateCueDto, ICueDto } from '@contracts'
import { TimeInput } from './TimeInput'

type CreateCueFormProps = {
  onSubmit: (data: CreateCueDto) => Promise<void>
  onCancel: () => void
  activePackId: string
  isLoading?: boolean
  initialValues?: ICueDto
}

export function CreateCueForm({
  onSubmit,
  onCancel,
  activePackId,
  isLoading = false,
  initialValues
}: CreateCueFormProps): JSX.Element {
  const secondsToMMSS = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const [text, setText] = useState(initialValues?.text || '')
  const [triggerType, setTriggerType] = useState<'interval' | 'oneTime' | 'event' | 'objective'>(
    initialValues?.triggerType || 'interval'
  )
  const [interval, setInterval] = useState<string>(
    initialValues?.interval ? secondsToMMSS(initialValues.interval) : ''
  )
  const [triggerAt, setTriggerAt] = useState<string>(
    initialValues?.triggerAt ? secondsToMMSS(initialValues.triggerAt) : ''
  )
  const [event, setEvent] = useState<string>(initialValues?.event || '')
  const [eventValue, setEventValue] = useState<string>(initialValues?.value?.toString() || '')
  const [objective, setObjective] = useState<'dragon' | 'baron' | 'grubs' | 'herald' | 'atakhan'>(
    initialValues?.objective || 'dragon'
  )
  const [beforeObjective, setBeforeObjective] = useState<string>(
    initialValues?.beforeObjective ? secondsToMMSS(initialValues.beforeObjective) : ''
  )
  const [endTime, setEndTime] = useState<string>(
    initialValues?.endTime ? secondsToMMSS(initialValues.endTime) : ''
  )

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
      if (event === 'gold-threshold') {
        if (!eventValue.trim()) {
          newErrors.eventValue = 'Gold threshold is required'
        } else {
          const eventValueNum = Number(eventValue)
          if (isNaN(eventValueNum) || eventValueNum < 0) {
            newErrors.eventValue = 'Gold threshold must be a non-negative number'
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
      if (event === 'gold-threshold' && eventValue.trim()) {
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
      if (event === 'gold-threshold') {
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
    <form onSubmit={handleSubmit} className="h-full flex flex-col">
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Left Sidebar - Trigger Type Selection */}
        <div className="w-72 flex-shrink-0 border-r border-border-primary/50 bg-bg-primary/30 p-5 overflow-y-auto">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-text-primary mb-1.5">Trigger Type</h2>
            <p className="text-sm text-text-tertiary/80">Choose when this cue should activate</p>
          </div>

          <div className="space-y-2.5">
            {[
              {
                value: 'interval',
                label: 'Every Interval',
                icon: 'interval',
                description: 'Repeats at regular intervals'
              },
              {
                value: 'oneTime',
                label: 'At Specific Time',
                icon: 'oneTime',
                description: 'Triggers once at a set time'
              },
              {
                value: 'event',
                label: 'On Event',
                icon: 'event',
                description: 'Activates on game event'
              },
              {
                value: 'objective',
                label: 'Before Objective',
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
                className={`w-full p-3.5 rounded-xl border-2 transition-all duration-200 text-left group ${
                  triggerType === option.value
                    ? 'border-info/50 bg-info/10 shadow-sm shadow-info/5'
                    : 'border-border-primary/50 bg-bg-secondary/50 hover:border-info/40 hover:bg-bg-tertiary/50 hover:shadow-sm'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-sm font-semibold mb-1 transition-colors ${
                      triggerType === option.value
                        ? 'text-info'
                        : 'text-text-primary group-hover:text-text-secondary'
                    }`}
                  >
                    {option.label}
                  </div>
                  <div className="text-sm text-text-tertiary/70 leading-relaxed">
                    {option.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="p-5 space-y-5">
            {/* Cue Text Section */}
            <div className="bg-bg-secondary/80 rounded-xl p-5 border border-border-primary/50 shadow-sm">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-text-primary mb-1.5">Cue Text</h2>
                <p className="text-sm text-text-tertiary/80">
                  What message should this cue display when it triggers?
                </p>
              </div>
              <div>
                <input
                  id="cue-text"
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="e.g., Check minimap, Ward pixel brush, Stack tear..."
                  className={`w-full px-4 py-3 text-base bg-bg-primary border rounded-xl text-text-primary placeholder-text-tertiary/60 focus:outline-none focus:ring-2 focus:ring-info/30 focus:border-info/50 transition-all duration-200 ${
                    errors.text
                      ? 'border-status-danger/60 focus:border-status-danger focus:ring-status-danger/20'
                      : 'border-border-primary/60'
                  }`}
                />
                {errors.text && (
                  <p className="mt-2 text-sm text-status-danger font-medium">{errors.text}</p>
                )}
              </div>
            </div>

            {/* Dynamic Trigger Settings */}
            <div className="bg-bg-secondary/80 rounded-xl p-5 border border-border-primary/50 shadow-sm">
              {triggerType === 'interval' && (
                <div>
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-text-primary mb-1.5">
                      Interval Settings
                    </h2>
                    <p className="text-sm text-text-tertiary/80">
                      How often should this cue repeat?
                    </p>
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
                <div>
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-text-primary mb-1.5">
                      Timing Settings
                    </h2>
                    <p className="text-sm text-text-tertiary/80">
                      At what game time should this cue trigger?
                    </p>
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
                <div>
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-text-primary mb-1.5">
                      Event Settings
                    </h2>
                    <p className="text-sm text-text-tertiary/80">
                      Select which game event should trigger this cue.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="cue-event"
                        className="block text-base font-medium text-text-primary mb-2"
                      >
                        Event Type
                      </label>
                      <select
                        id="cue-event"
                        value={event}
                        onChange={(e) => setEvent(e.target.value)}
                        className="w-full px-4 py-3 text-base bg-bg-primary border border-border-primary/60 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-warning/30 focus:border-warning/50 transition-all duration-200"
                      >
                        <option value="">Select an event</option>
                        <option value="respawn">Player respawn</option>
                        <option value="canon-wave-spawned">Canon wave spawned</option>
                        <option value="mana-changed">Mana changed</option>
                        <option value="gold-threshold">Gold threshold</option>
                        <option value="support-item-upgraded">Support item upgraded</option>
                      </select>
                      {errors.event && (
                        <p className="mt-2 text-sm text-status-danger font-medium">
                          {errors.event}
                        </p>
                      )}
                    </div>

                    {event === 'mana-changed' && (
                      <div>
                        <label
                          htmlFor="cue-event-value"
                          className="block text-base font-medium text-text-primary mb-2"
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
                          className={`w-full px-4 py-3 text-base bg-bg-primary border rounded-xl text-text-primary placeholder-text-tertiary/60 focus:outline-none focus:ring-2 focus:ring-warning/30 focus:border-warning/50 transition-all duration-200 ${
                            errors.eventValue
                              ? 'border-status-danger/60 focus:border-status-danger focus:ring-status-danger/20'
                              : 'border-border-primary/60'
                          }`}
                        />
                        <p className="mt-2 text-sm text-text-tertiary/70">
                          The cue will trigger when your mana is at or below this value
                        </p>
                        {errors.eventValue && (
                          <p className="mt-2 text-sm text-status-danger font-medium">
                            {errors.eventValue}
                          </p>
                        )}
                      </div>
                    )}

                    {event === 'gold-threshold' && (
                      <div>
                        <label
                          htmlFor="cue-event-value"
                          className="block text-base font-medium text-text-primary mb-2"
                        >
                          Gold Threshold
                        </label>
                        <input
                          id="cue-event-value"
                          type="number"
                          min="0"
                          value={eventValue}
                          onChange={(e) => setEventValue(e.target.value)}
                          placeholder="e.g., 3000"
                          className={`w-full px-4 py-3 text-base bg-bg-primary border rounded-xl text-text-primary placeholder-text-tertiary/60 focus:outline-none focus:ring-2 focus:ring-warning/30 focus:border-warning/50 transition-all duration-200 ${
                            errors.eventValue
                              ? 'border-status-danger/60 focus:border-status-danger focus:ring-status-danger/20'
                              : 'border-border-primary/60'
                          }`}
                        />
                        <p className="mt-2 text-sm text-text-tertiary/70">
                          The cue will trigger when your gold is at or above this value
                        </p>
                        {errors.eventValue && (
                          <p className="mt-2 text-sm text-status-danger font-medium">
                            {errors.eventValue}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {triggerType === 'objective' && (
                <div>
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-text-primary mb-1.5">
                      Objective Settings
                    </h2>
                    <p className="text-sm text-text-tertiary/80">
                      Choose which objective to track and when to trigger.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="cue-objective"
                        className="block text-base font-medium text-text-primary mb-2"
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
                        className="w-full px-4 py-3 text-base bg-bg-primary border border-border-primary/60 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-premium/30 focus:border-premium/50 transition-all duration-200"
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

            {/* Optional End Time */}
            <div className="bg-bg-secondary/80 rounded-xl p-5 border border-border-primary/50 shadow-sm">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-text-primary mb-1.5">
                  End Time (Optional)
                </h2>
                <p className="text-sm text-text-tertiary/80">
                  When should this cue stop triggering? Leave empty to continue indefinitely.
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
          </div>
        </div>
      </div>

      {/* Sticky Action Buttons */}
      <div className="flex-shrink-0 border-t border-border-primary/50 bg-bg-secondary/90 backdrop-blur-sm p-5">
        <div className="flex gap-3">
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
            {isLoading ? 'Creating...' : initialValues ? 'Update Cue' : 'Create Cue'}
          </Button>
        </div>
      </div>
    </form>
  )
}
