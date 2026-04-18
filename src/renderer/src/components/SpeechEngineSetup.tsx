import { JSX, useState } from 'react'
import { Cloud, Download, Cpu } from 'lucide-react'
import { Button } from './Button'
import { ModelDownloadProgress } from './ModelDownloadProgress'
import { useToast } from '@renderer/hooks'
import type { OpenAITtsModel, OpenAITtsVoice, SpeechEngineView } from '@contracts'

const OPENAI_MODELS: Array<{ value: OpenAITtsModel; label: string }> = [
  { value: 'tts-1', label: 'tts-1 (faster, cheaper)' },
  { value: 'tts-1-hd', label: 'tts-1-hd (higher quality)' }
]

const OPENAI_VOICES: OpenAITtsVoice[] = ['alloy', 'nova', 'echo', 'fable', 'onyx', 'shimmer']

type TestResult = null | { ok: true } | { ok: false; error: string }

type Props = {
  existing: SpeechEngineView
  onSaved: () => void
  /** If true, hides the cancel button — used during first-run onboarding. */
  required?: boolean
  onCancel?: () => void
}

export function SpeechEngineSetup({ existing, onSaved, required, onCancel }: Props): JSX.Element {
  const initialChoice: 'local' | 'openai' = existing?.type === 'openai' ? 'openai' : 'local'

  const [choice, setChoice] = useState<'local' | 'openai'>(initialChoice)
  const [isInstalling, setIsInstalling] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState<OpenAITtsModel>(
    existing?.type === 'openai' ? existing.model : 'tts-1'
  )
  const [voice, setVoice] = useState<OpenAITtsVoice>(
    existing?.type === 'openai' ? existing.voice : 'alloy'
  )
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<TestResult>(null)
  const toast = useToast()

  const hasStoredKey = existing?.type === 'openai'

  const handleInstallLocal = async (): Promise<void> => {
    try {
      setIsInstalling(true)
      await window.api.app.installLocalSpeechModel()
      toast.success('Local voice model installed.')
      onSaved()
    } catch (err) {
      toast.error(`Install failed: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsInstalling(false)
    }
  }

  const handleTestOpenAI = async (): Promise<void> => {
    if (!apiKey) {
      setTestResult({ ok: false, error: 'Please enter your API key to run a test.' })
      return
    }
    try {
      setIsTesting(true)
      setTestResult(null)
      await window.api.app.testOpenAIKey(apiKey, model, voice)
      setTestResult({ ok: true })
    } catch (err) {
      setTestResult({ ok: false, error: err instanceof Error ? err.message : String(err) })
    } finally {
      setIsTesting(false)
    }
  }

  const handleSaveOpenAI = async (): Promise<void> => {
    try {
      setIsSaving(true)
      await window.api.app.updateSpeechEngine({
        type: 'openai',
        apiKey: apiKey || undefined,
        model,
        voice
      })
      toast.success('OpenAI speech engine saved.')
      onSaved()
    } catch (err) {
      toast.error(`Save failed: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsSaving(false)
    }
  }

  const canSaveOpenAI = (hasStoredKey && !apiKey) || testResult?.ok === true

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <EngineChoice
          active={choice === 'local'}
          icon={<Cpu size={18} />}
          title="Local (offline)"
          description="Runs on your PC. One-time ~33 MB download, then no internet or API costs."
          onClick={() => setChoice('local')}
        />
        <EngineChoice
          active={choice === 'openai'}
          icon={<Cloud size={18} />}
          title="OpenAI (cloud)"
          description="Uses your own OpenAI API key. Higher quality voices, billed by OpenAI."
          onClick={() => setChoice('openai')}
        />
      </div>

      {choice === 'local' && (
        <LocalPanel
          existing={existing}
          isInstalling={isInstalling}
          onInstall={handleInstallLocal}
          onMarkSelected={async () => {
            await window.api.app.updateSpeechEngine({ type: 'local' })
            onSaved()
          }}
        />
      )}

      {choice === 'openai' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="openai-key" className="block text-sm font-medium text-text-primary">
              OpenAI API key
            </label>
            <input
              id="openai-key"
              type="password"
              autoComplete="off"
              spellCheck={false}
              placeholder={hasStoredKey ? existing?.maskedApiKey : 'sk-...'}
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value)
                setTestResult(null)
              }}
              className="w-full px-3 py-2 bg-bg-primary border border-border-primary rounded-lg text-text-primary text-sm focus:outline-none focus:border-border-accent"
            />
            <p className="text-xs text-text-tertiary">
              {hasStoredKey
                ? 'Leave blank to keep the existing key. Paste a new one to replace it.'
                : 'Stored encrypted on this device using OS-level protection.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label htmlFor="openai-model" className="block text-sm font-medium text-text-primary">
                Model
              </label>
              <select
                id="openai-model"
                value={model}
                onChange={(e) => setModel(e.target.value as OpenAITtsModel)}
                className="w-full px-3 py-2 bg-bg-primary border border-border-primary rounded-lg text-text-primary text-sm focus:outline-none focus:border-border-accent"
              >
                {OPENAI_MODELS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="openai-voice" className="block text-sm font-medium text-text-primary">
                Voice
              </label>
              <select
                id="openai-voice"
                value={voice}
                onChange={(e) => setVoice(e.target.value as OpenAITtsVoice)}
                className="w-full px-3 py-2 bg-bg-primary border border-border-primary rounded-lg text-text-primary text-sm focus:outline-none focus:border-border-accent"
              >
                {OPENAI_VOICES.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={handleTestOpenAI} disabled={isTesting || !apiKey}>
              {isTesting ? 'Testing...' : 'Test audio'}
            </Button>
            {testResult?.ok === true && (
              <span className="text-xs text-success">Test succeeded.</span>
            )}
            {testResult?.ok === false && (
              <span className="text-xs text-status-danger">{testResult.error}</span>
            )}
          </div>

          <div className="flex justify-end gap-3">
            {!required && onCancel && (
              <Button variant="secondary" onClick={onCancel} disabled={isSaving}>
                Cancel
              </Button>
            )}
            <Button onClick={handleSaveOpenAI} disabled={!canSaveOpenAI || isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      )}

      <ModelDownloadProgress isOpen={isInstalling} />
    </div>
  )
}

function EngineChoice({
  active,
  icon,
  title,
  description,
  onClick
}: {
  active: boolean
  icon: React.ReactNode
  title: string
  description: string
  onClick: () => void
}): JSX.Element {
  return (
    <button
      onClick={onClick}
      className={`text-left p-4 rounded-xl border transition-all ${
        active
          ? 'bg-[rgba(0,255,136,0.05)] border-[rgba(0,255,136,0.5)] shadow-[0_0_0_1px_rgba(0,255,136,0.3)]'
          : 'bg-bg-primary border-border-primary hover:border-border-accent'
      }`}
    >
      <div className="flex items-center gap-2 text-text-primary mb-1">
        {icon}
        <span className="font-medium">{title}</span>
      </div>
      <p className="text-xs text-text-tertiary leading-5">{description}</p>
    </button>
  )
}

function LocalPanel({
  existing,
  isInstalling,
  onInstall,
  onMarkSelected
}: {
  existing: SpeechEngineView
  isInstalling: boolean
  onInstall: () => void
  onMarkSelected: () => void
}): JSX.Element {
  const isCurrentlyLocal = existing?.type === 'local'
  const installed = isCurrentlyLocal && existing?.status === 'installed'

  return (
    <div className="space-y-3 p-4 rounded-xl bg-bg-primary border border-border-primary">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-text-primary">Kokoro v0.19 (English)</h3>
          <p className="text-xs text-text-tertiary mt-1">
            {installed
              ? 'Model is installed.'
              : '~33 MB one-time download. Stored in your user data folder.'}
          </p>
        </div>
        {installed ? (
          <Button variant="secondary" onClick={onInstall} disabled={isInstalling}>
            <Download size={14} className="mr-2" />
            Re-download
          </Button>
        ) : (
          <Button onClick={onInstall} disabled={isInstalling}>
            <Download size={14} className="mr-2" />
            {isInstalling ? 'Installing...' : 'Download model'}
          </Button>
        )}
      </div>
      {installed && !isCurrentlyLocal && (
        <div className="flex justify-end">
          <Button onClick={onMarkSelected}>Use local engine</Button>
        </div>
      )}
    </div>
  )
}
