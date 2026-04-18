import { JSX, useState } from 'react'
import { Button } from './Button'
import { CreateCueDto, ICueDto } from '@contracts'
import { TimeInput } from './TimeInput'
import { BuiltInTriggerId, CueObjective, CueTrigger } from '@hexagon/Cue'
import { PredicateBuilder } from './PredicateBuilder'
import {
  buildFiringModeFromState,
  buildPredicateFromState,
  CustomConditionState,
  defaultCustomConditionState,
  stateFromPredicate,
  validateConditionRows
} from './predicateFormState'

type TriggerMode = 'interval' | 'oneTime' | 'objective' | 'builtIn' | 'predicate'

type CreateCueFormProps = {
  onSubmit: (data: CreateCueDto) => Promise<void>
  onCancel: () => void
  activePackId: string
  isLoading?: boolean
  initialValues?: ICueDto
}

const secondsToMMSS = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const mmssToSeconds = (mmss: string): number | null => {
  const parts = mmss.split(':')
  if (parts.length !== 2) return null
  const mins = parseInt(parts[0], 10)
  const secs = parseInt(parts[1], 10)
  if (isNaN(mins) || isNaN(secs)) return null
  return mins * 60 + secs
}

const parseToSeconds = (value: string, isMMSS: boolean): number | null => {
  if (!value.trim()) return null
  if (isMMSS) return mmssToSeconds(value)
  return Number(value)
}

function modeFromInitialValues(initial: ICueDto | undefined): TriggerMode {
  if (!initial) return 'interval'
  return initial.trigger.kind
}

function initialCustomConditionFromCue(initial: ICueDto | undefined): CustomConditionState {
  if (!initial || initial.trigger.kind !== 'predicate') return defaultCustomConditionState
  const state = stateFromPredicate(initial.trigger.predicate, initial.trigger.firing)
  return state ?? defaultCustomConditionState
}

const presets: Array<{ id: string; label: string; state: CustomConditionState }> = [
  {
    id: 'low-mana',
    label: 'Low mana',
    state: {
      conditions: [{ field: 'activePlayer.currentMana', operator: '<=', value: '100' }],
      combinator: 'and',
      firingMode: 'edgeWithCooldown',
      cooldownSeconds: '60'
    }
  },
  {
    id: 'gold-threshold',
    label: 'Gold threshold',
    state: {
      conditions: [{ field: 'activePlayer.currentGold', operator: '>=', value: '3000' }],
      combinator: 'and',
      firingMode: 'edgeWithCooldown',
      cooldownSeconds: '60'
    }
  },
  {
    id: 'on-respawn',
    label: 'On respawn',
    state: {
      conditions: [{ field: 'activePlayer.respawnsIn', operator: '==', value: '1' }],
      combinator: 'and',
      firingMode: 'edge',
      cooldownSeconds: '60'
    }
  }
]

export function CreateCueForm({
  onSubmit,
  onCancel,
  activePackId,
  isLoading = false,
  initialValues
}: CreateCueFormProps): JSX.Element {
  const [text, setText] = useState(initialValues?.text || '')
  const [mode, setMode] = useState<TriggerMode>(modeFromInitialValues(initialValues))

  const initialTrigger = initialValues?.trigger

  const [interval, setInterval] = useState<string>(
    initialTrigger?.kind === 'interval' ? secondsToMMSS(initialTrigger.seconds) : ''
  )
  const [triggerAt, setTriggerAt] = useState<string>(
    initialTrigger?.kind === 'oneTime' ? secondsToMMSS(initialTrigger.at) : ''
  )
  const [objective, setObjective] = useState<CueObjective>(
    initialTrigger?.kind === 'objective' ? initialTrigger.objective : 'dragon'
  )
  const [beforeObjective, setBeforeObjective] = useState<string>(
    initialTrigger?.kind === 'objective' ? secondsToMMSS(initialTrigger.secondsBefore) : ''
  )
  const [builtInId, setBuiltInId] = useState<BuiltInTriggerId>(
    initialTrigger?.kind === 'builtIn' ? initialTrigger.id : 'canon-wave-spawned'
  )
  const [customState, setCustomState] = useState<CustomConditionState>(
    initialCustomConditionFromCue(initialValues)
  )

  const [endTime, setEndTime] = useState<string>(
    initialValues?.endTime ? secondsToMMSS(initialValues.endTime) : ''
  )

  const [useMMSSInterval, setUseMMSSInterval] = useState(true)
  const [useMMSSTriggerAt, setUseMMSSTriggerAt] = useState(true)
  const [useMMSSBeforeObjective, setUseMMSSBeforeObjective] = useState(true)
  const [useMMSSEndTime, setUseMMSSEndTime] = useState(true)

  const [errors, setErrors] = useState<{
    text?: string
    interval?: string
    triggerAt?: string
    beforeObjective?: string
    endTime?: string
    predicateValues?: Record<number, string>
    cooldownSeconds?: string
  }>({})

  const handleSubmit = async (formEvent: React.FormEvent): Promise<void> => {
    formEvent.preventDefault()

    const newErrors: typeof errors = {}

    if (!text.trim()) newErrors.text = 'Text is required'

    let trigger: CueTrigger | null = null

    switch (mode) {
      case 'interval': {
        const seconds = parseToSeconds(interval, useMMSSInterval)
        if (seconds === null || isNaN(seconds) || seconds < 1) {
          newErrors.interval = 'Interval must be positive'
        } else {
          trigger = { kind: 'interval', seconds }
        }
        break
      }
      case 'oneTime': {
        const at = parseToSeconds(triggerAt, useMMSSTriggerAt)
        if (at === null || isNaN(at) || at < 0) {
          newErrors.triggerAt = 'Trigger time must be non-negative'
        } else {
          trigger = { kind: 'oneTime', at }
        }
        break
      }
      case 'objective': {
        const secondsBefore = parseToSeconds(beforeObjective, useMMSSBeforeObjective)
        if (secondsBefore === null || isNaN(secondsBefore) || secondsBefore < 0) {
          newErrors.beforeObjective = 'Time before objective must be non-negative'
        } else {
          trigger = { kind: 'objective', objective, secondsBefore }
        }
        break
      }
      case 'builtIn':
        trigger = { kind: 'builtIn', id: builtInId }
        break
      case 'predicate': {
        const rowErrors = validateConditionRows(customState)
        if (Object.keys(rowErrors).length > 0) {
          newErrors.predicateValues = rowErrors
          break
        }
        const predicate = buildPredicateFromState(customState)
        const firing = buildFiringModeFromState(customState)
        if (!predicate) {
          newErrors.predicateValues = { 0: 'Invalid condition' }
          break
        }
        if (!firing) {
          newErrors.cooldownSeconds = 'Cooldown must be a positive number'
          break
        }
        trigger = { kind: 'predicate', predicate, firing }
        break
      }
    }

    if (endTime.trim()) {
      const endTimeNum = parseToSeconds(endTime, useMMSSEndTime)
      if (endTimeNum === null || isNaN(endTimeNum) || endTimeNum < 1) {
        newErrors.endTime = 'End time must be positive'
      }
    }

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0 || !trigger) return

    const formData: CreateCueDto = {
      text: text.trim(),
      trigger,
      packId: activePackId
    }

    if (endTime.trim()) {
      const endTimeNum = parseToSeconds(endTime, useMMSSEndTime)
      if (endTimeNum !== null && endTimeNum > 0) formData.endTime = endTimeNum
    }

    await onSubmit(formData)
  }

  const isFormValid = (): boolean => {
    if (!text.trim()) return false
    switch (mode) {
      case 'interval':
        return Boolean(interval.trim())
      case 'oneTime':
        return Boolean(triggerAt.trim())
      case 'objective':
        return Boolean(beforeObjective.trim())
      case 'builtIn':
        return true
      case 'predicate':
        return customState.conditions.every((row) => {
          if (row.operator === 'contains') return row.value.trim() !== ''
          return row.value !== '' && row.value.trim() !== ''
        })
    }
  }

  const modeOptions: Array<{ value: TriggerMode; label: string; description: string }> = [
    {
      value: 'interval',
      label: 'Every Interval',
      description: 'Repeats at regular intervals'
    },
    {
      value: 'oneTime',
      label: 'At Specific Time',
      description: 'Triggers once at a set time'
    },
    {
      value: 'objective',
      label: 'Before Objective',
      description: 'Warns before objectives spawn'
    },
    {
      value: 'builtIn',
      label: 'Built-in Event',
      description: 'Canon wave, support item upgrade'
    },
    {
      value: 'predicate',
      label: 'Custom Condition',
      description: 'Build your own based on game state'
    }
  ]

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col">
      <div className="flex-1 flex gap-4 overflow-hidden">
        <div className="w-72 flex-shrink-0 border-r border-border-primary/50 bg-bg-primary/30 p-5 overflow-y-auto">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-text-primary mb-1.5">Trigger Type</h2>
            <p className="text-sm text-text-tertiary/80">Choose when this cue should activate</p>
          </div>

          <div className="space-y-2.5">
            {modeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setMode(option.value)}
                className={`w-full p-3.5 rounded-xl border-2 transition-all duration-200 text-left group ${
                  mode === option.value
                    ? 'border-info/50 bg-info/10 shadow-sm shadow-info/5'
                    : 'border-border-primary/50 bg-bg-secondary/50 hover:border-info/40 hover:bg-bg-tertiary/50 hover:shadow-sm'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-sm font-semibold mb-1 transition-colors ${
                      mode === option.value
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

        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="p-5 space-y-5">
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

            <div className="bg-bg-secondary/80 rounded-xl p-5 border border-border-primary/50 shadow-sm">
              {mode === 'interval' && (
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

              {mode === 'oneTime' && (
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

              {mode === 'objective' && (
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
                        onChange={(e) => setObjective(e.target.value as CueObjective)}
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

              {mode === 'builtIn' && (
                <div>
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-text-primary mb-1.5">
                      Built-in Event
                    </h2>
                    <p className="text-sm text-text-tertiary/80">
                      Pre-defined events maintained in the app. Use Custom Condition for anything
                      else.
                    </p>
                  </div>
                  <select
                    id="cue-built-in"
                    value={builtInId}
                    onChange={(e) => setBuiltInId(e.target.value as BuiltInTriggerId)}
                    className="w-full px-4 py-3 text-base bg-bg-primary border border-border-primary/60 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-warning/30 focus:border-warning/50 transition-all duration-200"
                  >
                    <option value="canon-wave-spawned">Canon wave spawned</option>
                    <option value="support-item-upgraded">Support item upgraded</option>
                  </select>
                </div>
              )}

              {mode === 'predicate' && (
                <div>
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-text-primary mb-1.5">
                      Custom Condition
                    </h2>
                    <p className="text-sm text-text-tertiary/80">
                      Fire when a game-state field matches your chosen condition.
                    </p>
                  </div>

                  <div className="mb-5">
                    <div className="text-sm font-medium text-text-secondary mb-2">
                      Quick presets
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {presets.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setCustomState(preset.state)}
                          className="px-3 py-1.5 text-sm font-medium rounded-lg border border-border-primary/60 bg-bg-primary/50 text-text-secondary hover:border-info/40 hover:text-info transition-colors"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <PredicateBuilder
                    state={customState}
                    onChange={setCustomState}
                    errors={{
                      values: errors.predicateValues,
                      cooldownSeconds: errors.cooldownSeconds
                    }}
                  />
                </div>
              )}
            </div>

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
