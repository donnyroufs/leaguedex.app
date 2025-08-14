import { JSX, useEffect, useState } from 'react'
import { Timer, Brain } from 'lucide-react'
import { ToggleSwitch } from '../components/ToggleSwitch'
import { PageWrapper } from '../components/PageWrapper'

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
  insights: {
    ai: {
      enabled: boolean
      apiKey: string | null
    }
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
      ...config!,
      gameAssistance: {
        ...config!.gameAssistance,
        enableNeutralObjectiveTimers: checked
      }
    })

    setConfig(updatedConfig)
  }

  async function onUpdateAI(checked: boolean): Promise<void> {
    const updatedConfig = await window.api.updateConfig({
      ...config!,
      insights: {
        ...config!.insights,
        ai: {
          ...config!.insights.ai,
          enabled: checked
        }
      }
    })

    setConfig(updatedConfig)
  }

  async function onUpdateApiKey(apiKey: string): Promise<void> {
    const updatedConfig = await window.api.updateConfig({
      ...config!,
      insights: {
        ...config!.insights,
        ai: {
          ...config!.insights.ai,
          apiKey
        }
      }
    })

    setConfig(updatedConfig)
  }

  if (!config) {
    return <div>Loading...</div>
  }

  return (
    <PageWrapper>
      <div className="flex items-center justify-between h-[88px] px-8 bg-[rgba(255,255,255,0.02)] border-b border-[rgba(255,255,255,0.1)] flex-shrink-0">
        <h1 className="text-2xl font-semibold text-text-primary">Settings</h1>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0 p-8 space-y-8">
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

        <SettingsSection title="Insights" icon={Brain}>
          <div className="space-y-6">
            <ToggleSwitch
              checked={config.insights.ai.enabled}
              onChange={onUpdateAI}
              label="Enable AI"
              description="Enable AI-powered insights and analysis"
            />

            <div className="space-y-2">
              <label className="text-base font-medium text-text-primary leading-6">API Key</label>
              <p className="text-sm text-text-tertiary leading-5">
                Enter your API key for AI services
              </p>
              <input
                type="password"
                value={config.insights.ai.apiKey || ''}
                onChange={(e) => onUpdateApiKey(e.target.value)}
                placeholder="Enter your API key"
                className="w-full px-4 py-3 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-info focus:border-transparent transition-all duration-200 font-mono text-sm"
                style={{ letterSpacing: '0.1em' }}
              />
            </div>
          </div>
        </SettingsSection>
      </div>
    </PageWrapper>
  )
}
