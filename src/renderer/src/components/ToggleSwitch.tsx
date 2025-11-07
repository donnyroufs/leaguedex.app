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
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ${
          checked
            ? 'bg-[rgba(0,255,136,0.1)] border border-[rgba(0,255,136,0.3)]'
            : 'bg-border-secondary border border-transparent'
        }`}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full transition-all duration-200 ${
            checked ? 'translate-x-6 bg-[rgb(0,255,136)]' : 'translate-x-1 bg-white'
          }`}
        />
      </button>
    </div>
  )
}
