import { JSX } from 'react'
import { Bell } from 'lucide-react'
import { PageWrapper } from '../components/PageWrapper'

type EmptyStateProps = {
  title: string
  subtitle: string
}

function EmptyState({ title, subtitle }: EmptyStateProps): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 bg-[rgba(255,255,255,0.05)] rounded-[16px] flex items-center justify-center mb-6 text-2xl">
        <Bell size={32} className="text-text-tertiary" />
      </div>
      <h3 className="text-lg text-text-secondary mb-2">{title}</h3>
      <p className="text-sm text-text-tertiary max-w-96 mb-6">{subtitle}</p>
    </div>
  )
}

export function RemindersPage(): JSX.Element {
  return (
    <PageWrapper>
      <div className="flex items-center justify-between h-[88px] px-8 bg-[rgba(255,255,255,0.02)] border-b border-[rgba(255,255,255,0.1)] flex-shrink-0">
        <h1 className="text-2xl font-semibold text-text-primary">Reminders</h1>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0 p-8 space-y-8 flex items-center justify-center">
        <EmptyState title="No reminders" subtitle="Add a reminder to get started" />
      </div>
    </PageWrapper>
  )
}
