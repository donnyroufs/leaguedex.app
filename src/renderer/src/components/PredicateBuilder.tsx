import { JSX } from 'react'
import { Plus, X } from 'lucide-react'
import { gameStateFields, getFieldDefinition } from '@hexagon/triggers/GameStateSchema'
import {
  ConditionRow,
  CustomConditionState,
  UiOperator,
  defaultConditionRow,
  defaultValueForField,
  getOperatorsForField,
  isArrayField,
  isBooleanField,
  isEnumField
} from './predicateFormState'

type Props = {
  state: CustomConditionState
  onChange: (next: CustomConditionState) => void
  errors: { values?: Record<number, string>; cooldownSeconds?: string }
}

const operatorLabels: Record<UiOperator, string> = {
  '<': 'is less than',
  '<=': 'is less than or equal to',
  '==': 'equals',
  '!=': 'is not equal to',
  '>=': 'is greater than or equal to',
  '>': 'is greater than',
  contains: 'contains'
}

export function PredicateBuilder({ state, onChange, errors }: Props): JSX.Element {
  const updateRow = (index: number, next: ConditionRow): void => {
    const conditions = state.conditions.map((row, i) => (i === index ? next : row))
    onChange({ ...state, conditions })
  }

  const addRow = (): void => {
    onChange({ ...state, conditions: [...state.conditions, { ...defaultConditionRow }] })
  }

  const removeRow = (index: number): void => {
    if (state.conditions.length === 1) return
    onChange({ ...state, conditions: state.conditions.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-5">
      {state.conditions.length > 1 && (
        <div>
          <label className="block text-base font-medium text-text-primary mb-2">Match</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onChange({ ...state, combinator: 'and' })}
              className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl border-2 transition-all ${
                state.combinator === 'and'
                  ? 'border-info/50 bg-info/10 text-info'
                  : 'border-border-primary/50 bg-bg-primary/40 text-text-secondary hover:border-info/40'
              }`}
            >
              ALL conditions (AND)
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...state, combinator: 'or' })}
              className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl border-2 transition-all ${
                state.combinator === 'or'
                  ? 'border-info/50 bg-info/10 text-info'
                  : 'border-border-primary/50 bg-bg-primary/40 text-text-secondary hover:border-info/40'
              }`}
            >
              ANY condition (OR)
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {state.conditions.map((row, index) => (
          <ConditionRowEditor
            key={index}
            row={row}
            index={index}
            canRemove={state.conditions.length > 1}
            onChange={(next) => updateRow(index, next)}
            onRemove={() => removeRow(index)}
            valueError={errors.values?.[index]}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border border-dashed border-border-primary/70 bg-bg-primary/30 text-text-secondary hover:border-info/50 hover:text-info transition-all"
      >
        <Plus className="w-4 h-4" />
        Add condition
      </button>

      <FiringModeSection state={state} onChange={onChange} cooldownError={errors.cooldownSeconds} />
    </div>
  )
}

type RowEditorProps = {
  row: ConditionRow
  index: number
  canRemove: boolean
  onChange: (next: ConditionRow) => void
  onRemove: () => void
  valueError?: string
}

function ConditionRowEditor({
  row,
  index,
  canRemove,
  onChange,
  onRemove,
  valueError
}: RowEditorProps): JSX.Element {
  const field = getFieldDefinition(row.field)
  const availableOperators = getOperatorsForField(field)

  const handleFieldChange = (path: string): void => {
    const nextField = getFieldDefinition(path)
    const nextOperators = getOperatorsForField(nextField)
    const keepOperator = nextOperators.includes(row.operator)
    onChange({
      field: path,
      operator: keepOperator ? row.operator : nextOperators[0],
      value: defaultValueForField(nextField)
    })
  }

  return (
    <div className="rounded-xl border border-border-primary/50 bg-bg-primary/30 p-4">
      <div className="flex items-start gap-2">
        <div className="flex-1 space-y-3">
          <div>
            <label
              htmlFor={`predicate-field-${index}`}
              className="block text-sm font-medium text-text-secondary mb-1.5"
            >
              Field
            </label>
            <select
              id={`predicate-field-${index}`}
              value={row.field}
              onChange={(e) => handleFieldChange(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-bg-primary border border-border-primary/60 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-info/30 focus:border-info/50 transition-all"
            >
              {gameStateFields.map((f) => (
                <option key={f.path} value={f.path}>
                  {f.label}
                  {f.unit ? ` (${f.unit})` : ''}
                </option>
              ))}
            </select>
            {field?.nullMeans && (
              <p className="mt-1.5 text-xs text-text-tertiary/70">
                Never fires when null ({field.nullMeans}).
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor={`predicate-operator-${index}`}
                className="block text-sm font-medium text-text-secondary mb-1.5"
              >
                Operator
              </label>
              <select
                id={`predicate-operator-${index}`}
                value={row.operator}
                onChange={(e) => onChange({ ...row, operator: e.target.value as UiOperator })}
                className="w-full px-3 py-2.5 text-sm bg-bg-primary border border-border-primary/60 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-info/30 focus:border-info/50 transition-all"
              >
                {availableOperators.map((op) => (
                  <option key={op} value={op}>
                    {op} — {operatorLabels[op]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor={`predicate-value-${index}`}
                className="block text-sm font-medium text-text-secondary mb-1.5"
              >
                Value
              </label>
              <ValueInput
                id={`predicate-value-${index}`}
                row={row}
                onChange={(value) => onChange({ ...row, value })}
                error={valueError}
              />
            </div>
          </div>

          {isArrayField(field) && (
            <p className="text-xs text-text-tertiary/70">
              Item IDs come from Riot data dragon. Example: 3078 = Trinity Force.
            </p>
          )}
          {valueError && <p className="text-sm text-status-danger font-medium">{valueError}</p>}
        </div>

        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 rounded-md hover:bg-bg-primary/50 transition-colors"
            aria-label="Remove condition"
          >
            <X className="w-4 h-4 text-text-tertiary hover:text-status-danger" />
          </button>
        )}
      </div>
    </div>
  )
}

function ValueInput({
  id,
  row,
  onChange,
  error
}: {
  id: string
  row: ConditionRow
  onChange: (value: string) => void
  error?: string
}): JSX.Element {
  const field = getFieldDefinition(row.field)

  if (isBooleanField(field)) {
    return (
      <select
        id={id}
        value={row.value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2.5 text-sm bg-bg-primary border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-info/30 focus:border-info/50 transition-all ${
          error ? 'border-status-danger/60' : 'border-border-primary/60'
        }`}
      >
        <option value="true">true</option>
        <option value="false">false</option>
      </select>
    )
  }

  if (isEnumField(field) && field?.enumValues) {
    return (
      <select
        id={id}
        value={row.value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2.5 text-sm bg-bg-primary border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-info/30 focus:border-info/50 transition-all ${
          error ? 'border-status-danger/60' : 'border-border-primary/60'
        }`}
      >
        {field.enumValues.map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </select>
    )
  }

  return (
    <input
      id={id}
      type="number"
      value={row.value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={isArrayField(field) ? 'e.g., 3078' : 'e.g., 30'}
      className={`w-full px-3 py-2.5 text-sm bg-bg-primary border rounded-lg text-text-primary placeholder-text-tertiary/60 focus:outline-none focus:ring-2 focus:ring-info/30 focus:border-info/50 transition-all ${
        error ? 'border-status-danger/60' : 'border-border-primary/60'
      }`}
    />
  )
}

function FiringModeSection({
  state,
  onChange,
  cooldownError
}: {
  state: CustomConditionState
  onChange: (next: CustomConditionState) => void
  cooldownError?: string
}): JSX.Element {
  return (
    <div>
      <label className="block text-base font-medium text-text-primary mb-2">Firing</label>
      <div className="space-y-2">
        <label className="flex items-center gap-3 p-3 rounded-xl border border-border-primary/50 bg-bg-primary/40 cursor-pointer hover:border-info/40 transition-colors">
          <input
            type="radio"
            name="firing-mode"
            value="edge"
            checked={state.firingMode === 'edge'}
            onChange={() => onChange({ ...state, firingMode: 'edge' })}
          />
          <div>
            <div className="text-sm font-semibold text-text-primary">Fire once on change</div>
            <div className="text-sm text-text-tertiary/80">
              Fires when the condition first becomes true, re-arms once it becomes false again.
            </div>
          </div>
        </label>

        <label className="flex items-start gap-3 p-3 rounded-xl border border-border-primary/50 bg-bg-primary/40 cursor-pointer hover:border-info/40 transition-colors">
          <input
            type="radio"
            name="firing-mode"
            value="edgeWithCooldown"
            checked={state.firingMode === 'edgeWithCooldown'}
            onChange={() => onChange({ ...state, firingMode: 'edgeWithCooldown' })}
            className="mt-1"
          />
          <div className="flex-1">
            <div className="text-sm font-semibold text-text-primary">
              Fire on change, then cooldown
            </div>
            <div className="text-sm text-text-tertiary/80 mb-2">
              Fires when the condition is true, then waits the cooldown before it can fire again.
            </div>
            {state.firingMode === 'edgeWithCooldown' && (
              <div>
                <input
                  type="number"
                  min="1"
                  value={state.cooldownSeconds}
                  onChange={(e) => onChange({ ...state, cooldownSeconds: e.target.value })}
                  placeholder="60"
                  className={`w-32 px-3 py-2 text-sm bg-bg-primary border rounded-lg text-text-primary placeholder-text-tertiary/60 focus:outline-none focus:ring-2 focus:ring-info/30 focus:border-info/50 transition-all ${
                    cooldownError
                      ? 'border-status-danger/60 focus:border-status-danger focus:ring-status-danger/20'
                      : 'border-border-primary/60'
                  }`}
                />
                <span className="ml-2 text-sm text-text-tertiary/80">seconds</span>
                {cooldownError && (
                  <p className="mt-1 text-sm text-status-danger font-medium">{cooldownError}</p>
                )}
              </div>
            )}
          </div>
        </label>

        <label className="flex items-center gap-3 p-3 rounded-xl border border-border-primary/50 bg-bg-primary/40 cursor-pointer hover:border-info/40 transition-colors">
          <input
            type="radio"
            name="firing-mode"
            value="oncePerGame"
            checked={state.firingMode === 'oncePerGame'}
            onChange={() => onChange({ ...state, firingMode: 'oncePerGame' })}
          />
          <div>
            <div className="text-sm font-semibold text-text-primary">Once per game</div>
            <div className="text-sm text-text-tertiary/80">
              Fires only the first time the condition becomes true in a game.
            </div>
          </div>
        </label>
      </div>
    </div>
  )
}
