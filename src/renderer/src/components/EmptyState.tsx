import { JSX } from 'react'

type Props = {
  title: string
  subtitle: string
  icon: React.ReactNode
}

export function EmptyState({ title, subtitle, icon }: Props): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 bg-[rgba(255,255,255,0.05)] rounded-[16px] flex items-center justify-center mb-6 text-2xl">
        {icon}
      </div>
      <h3 className="text-lg text-text-secondary mb-2">{title}</h3>
      <p className="text-sm text-text-tertiary max-w-96 mb-6">{subtitle}</p>
    </div>
  )
}
