import { JSX } from 'react'
import { useNavigate, useLoaderData } from 'react-router'
import { PageWrapper } from '../components/PageWrapper'
import { SpeechEngineSetup } from '../components/SpeechEngineSetup'
import type { SpeechEngineView } from '@contracts'

export function Onboarding(): JSX.Element {
  const existing = useLoaderData<SpeechEngineView>()
  const navigate = useNavigate()

  return (
    <PageWrapper>
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">Welcome to Leaguedex</h1>
            <p className="text-sm text-text-tertiary mt-2 leading-6">
              Pick a speech engine to play audio cues during your games. You can switch between
              local and cloud at any time from Settings.
            </p>
          </div>
          <SpeechEngineSetup
            existing={existing}
            required
            onSaved={() => navigate('/', { replace: true })}
          />
        </div>
      </div>
    </PageWrapper>
  )
}
