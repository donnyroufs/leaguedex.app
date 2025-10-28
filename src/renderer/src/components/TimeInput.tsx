import { Clock12 } from 'lucide-react'
import { JSX } from 'react'

type Props = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  placeholder: string
  useMMSS: boolean
  onToggleMMSS: () => void
  disabled?: boolean
}

export function TimeInput({
  id,
  label,
  value,
  onChange,
  error,
  placeholder,
  useMMSS,
  onToggleMMSS,
  disabled
}: Props): JSX.Element {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label htmlFor={id} className="block text-sm font-medium text-text-primary">
          {label}
        </label>
        <button
          type="button"
          onClick={onToggleMMSS}
          disabled={disabled}
          className={`group relative flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md border transition-all duration-200 ${
            useMMSS
              ? 'bg-info/10 text-info border-info/30 hover:bg-info/20 hover:border-info/40 shadow-sm shadow-info/5'
              : 'bg-bg-secondary text-text-secondary border-border-primary hover:bg-bg-tertiary hover:border-border-accent shadow-sm'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}`}
          title={`Click to switch to ${useMMSS ? 'seconds' : 'MM:ss'} format`}
        >
          <Clock12
            className={`w-3.5 h-3.5 transition-transform group-hover:scale-110 ${useMMSS ? 'text-info' : 'text-text-tertiary'}`}
          />
          <span className="font-semibold">{useMMSS ? 'MM:SS' : 'Seconds'}</span>
          <span className={`ml-0.5 opacity-60 ${useMMSS ? 'text-info' : ''}`}>▾</span>
        </button>
      </div>
      <input
        id={id}
        type={useMMSS ? 'text' : 'number'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        pattern={useMMSS ? '^[0-9]{1,3}:[0-5][0-9]$' : undefined}
        disabled={disabled}
        className={`w-full px-4 py-3 bg-bg-primary border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 transition-all duration-200 ${
          error
            ? 'border-status-danger'
            : 'border-border-primary focus:border-info/40 focus:ring-info/20'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
      {error && <p className="mt-2 text-sm text-status-danger">{error}</p>}
      {useMMSS && value && !error && (
        <p className="mt-1 text-xs text-text-tertiary">
          Format: MM:SS (e.g., 5:30 = 5 minutes 30 seconds)
        </p>
      )}
    </div>
  )
}
