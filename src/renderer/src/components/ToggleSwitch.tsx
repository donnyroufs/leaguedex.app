import { JSX } from 'react'
import { ToggleSwitchProps } from '../pages/Settings'

export function ToggleSwitch({
  checked,
  onChange,
  label,
  description
}: ToggleSwitchProps): JSX.Element {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex-1 pr-8">
        <label className="text-base font-medium text-text-primary leading-6">{label}</label>
        {description && <p className="text-sm text-text-tertiary mt-1 leading-5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-info focus:ring-offset-2 focus:ring-offset-bg-secondary ${checked ? 'bg-info shadow-lg shadow-info/25' : 'bg-border-secondary'}`}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-all duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'}`}
        />
      </button>
    </div>
  )
}
