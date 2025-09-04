import { JSX, useState } from 'react'
import { Cloud, Eye, EyeOff } from 'lucide-react'
import { PageWrapper } from '../components/PageWrapper'
import { useLoaderData, useRevalidator } from 'react-router'
import { Button } from '@renderer/components/Button'
import { useToast } from '@renderer/hooks'

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
  const { license } = useLoaderData<{ license: string | null }>()
  const { revalidate } = useRevalidator()
  const [licenseKey, setLicenseKey] = useState<string>(license ?? '')
  const [showLicenseKey, setShowLicenseKey] = useState<boolean>(false)
  const toast = useToast()

  const handleUpdateLicense = async (): Promise<void> => {
    await window.api.app.updateLicense(licenseKey)
    await revalidate()
    toast.success('Restart app to apply the new license.')
  }

  const notChanged = licenseKey === license

  return (
    <PageWrapper>
      <div className="flex items-center justify-between h-20 p-8 border-b border-border-primary">
        <h1 className="text-2xl font-semibold text-text-primary">Settings</h1>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0 p-8 space-y-8">
        <SettingsSection title="General" icon={Cloud}>
          <div className="space-y-6">
            <div className="space-y-3">
              <label htmlFor="licenseKey" className="block text-sm font-medium text-text-primary">
                License Key
              </label>
              <div className="relative">
                <input
                  id="licenseKey"
                  type={showLicenseKey ? 'text' : 'password'}
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  placeholder="Enter your license key"
                  className="w-full px-3 py-3 pr-10 bg-bg-primary border border-border-primary rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-info/20 focus:border-info"
                />
                <button
                  type="button"
                  onClick={() => setShowLicenseKey(!showLicenseKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-tertiary hover:text-text-primary transition-colors"
                >
                  {showLicenseKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-sm text-text-tertiary leading-5">
                Close friends / trusted members can request one to test the latest features for
                free.
              </p>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleUpdateLicense} disabled={notChanged}>
                Update License
              </Button>
            </div>
          </div>
        </SettingsSection>
      </div>
    </PageWrapper>
  )
}
