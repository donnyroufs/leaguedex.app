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
      <label htmlFor={id} className="block text-base font-medium text-text-primary mb-2">
        {label}
      </label>
      <div className="flex gap-2 mb-1.5">
        <input
          id={id}
          type={useMMSS ? 'text' : 'number'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          pattern={useMMSS ? '^[0-9]{1,3}:[0-5][0-9]$' : undefined}
          disabled={disabled}
          className={`flex-1 px-4 py-3 text-base bg-bg-primary border rounded-xl text-text-primary placeholder-text-tertiary/60 focus:outline-none focus:ring-2 transition-all duration-200 ${
            error
              ? 'border-status-danger/60 focus:border-status-danger focus:ring-status-danger/20'
              : 'border-border-primary/60 focus:border-info/50 focus:ring-info/30'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
        <button
          type="button"
          onClick={onToggleMMSS}
          disabled={disabled}
          className={`flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-medium rounded-xl border transition-all duration-200 flex-shrink-0 ${
            useMMSS
              ? 'bg-info/10 text-info border-info/30 hover:bg-info/20 hover:border-info/40 shadow-sm'
              : 'bg-bg-secondary text-text-secondary border-border-primary/60 hover:bg-bg-tertiary hover:border-border-accent'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          title={`Click to switch to ${useMMSS ? 'seconds' : 'MM:ss'} format`}
        >
          <Clock12
            className={`w-3.5 h-3.5 ${useMMSS ? 'text-info' : 'text-text-tertiary'}`}
          />
          <span className="font-semibold">{useMMSS ? 'MM:SS' : 'Sec'}</span>
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-status-danger font-medium">{error}</p>}
      {useMMSS && value && !error && (
        <p className="mt-1.5 text-sm text-text-tertiary/70">
          Format: MM:SS (e.g., 5:30 = 5 minutes 30 seconds)
        </p>
      )}
    </div>
  )
}
