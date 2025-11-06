import { JSX, useState } from 'react'
import { Volume2 } from 'lucide-react'
import { PageWrapper } from '../components/PageWrapper'
import { useLoaderData, useRevalidator } from 'react-router'
import { Button } from '@renderer/components/Button'
import { useToast } from '@renderer/hooks'
import { IUserSettingsDto } from '@contracts'

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

export function Settings(): JSX.Element {
  const settings = useLoaderData<IUserSettingsDto>()
  const { revalidate } = useRevalidator()
  const [volume, setVolume] = useState<number>(settings.volume)
  const toast = useToast()

  const handleUpdateVolume = async (): Promise<void> => {
    await window.api.app.updateUserSettings({ volume })
    await revalidate()
    toast.success('Volume settings saved.')
  }

  const volumeNotChanged = volume === settings.volume

  return (
    <PageWrapper>
      <div className="flex items-center justify-between h-20 p-8 border-b border-border-primary">
        <h1 className="text-2xl font-semibold text-text-primary">Settings</h1>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0 p-8 space-y-8">
        <SettingsSection title="Cues" icon={Volume2}>
          <div className="space-y-6">
            <div className="space-y-3">
              <label htmlFor="volume" className="block text-sm font-medium text-text-primary">
                Volume
              </label>
              <div className="space-y-2">
                <input
                  id="volume"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full h-2 bg-bg-primary rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-text-tertiary">
                  <span>0%</span>
                  <span className="font-medium text-text-primary">{Math.round(volume * 100)}%</span>
                  <span>100%</span>
                </div>
              </div>
              <p className="text-sm text-text-tertiary leading-5">
                Adjust the volume for audio cues.
              </p>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleUpdateVolume} disabled={volumeNotChanged}>
                Save Volume
              </Button>
            </div>
          </div>
        </SettingsSection>
      </div>
    </PageWrapper>
  )
}
