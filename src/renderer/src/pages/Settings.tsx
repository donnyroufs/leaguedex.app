import { JSX, useEffect, useState } from 'react'
import { Timer } from 'lucide-react'
import { ToggleSwitch } from '../components/ToggleSwitch'

type SettingsSectionProps = {
  title: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  children: React.ReactNode
}

function SettingsSection({ title, icon: Icon, children }: SettingsSectionProps): JSX.Element {
  return (
    <div className="bg-bg-secondary border border-border-primary rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border-primary bg-bg-tertiary">
        <div className="p-2 bg-info/10 rounded-lg">
          <Icon size={18} className="text-info" />
        </div>
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
      </div>
      <div className="p-8 space-y-8">{children}</div>
    </div>
  )
}

export type ToggleSwitchProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
}

type UserConfig = {
  gameAssistance: {
    enableNeutralObjectiveTimers: boolean
  }
}

export function Settings(): JSX.Element {
  const [config, setConfig] = useState<UserConfig>()

  useEffect(() => {
    window.api.getConfig().then((config) => {
      setConfig(config)
    })
  }, [])

  async function onUpdateNeutralTimers(checked: boolean): Promise<void> {
    const updatedConfig = await window.api.updateConfig({
      gameAssistance: { enableNeutralObjectiveTimers: checked }
    })

    setConfig(updatedConfig)
  }

  if (!config) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between h-[88px] px-8 bg-[rgba(255,255,255,0.02)] border-b border-[rgba(255,255,255,0.1)]">
        <h1 className="text-2xl font-semibold text-text-primary">Settings</h1>
      </div>
      <div className="p-8">
        <SettingsSection title="Game Assistance" icon={Timer}>
          <div className="space-y-2">
            <ToggleSwitch
              checked={config.gameAssistance.enableNeutralObjectiveTimers}
              onChange={onUpdateNeutralTimers}
              label="Neutral Objective Timers"
              description="Enable automatic timers for dragon, baron, and other neutral objectives"
            />
          </div>
        </SettingsSection>
      </div>
    </div>
  )
}
