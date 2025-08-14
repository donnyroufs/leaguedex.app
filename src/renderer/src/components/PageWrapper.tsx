import { JSX, ReactNode } from 'react'

type PageWrapperProps = {
  children: ReactNode
  className?: string
}

export function PageWrapper({ children, className = '' }: PageWrapperProps): JSX.Element {
  return (
    <div className={`h-full flex flex-col overflow-hidden min-h-0 ${className}`}>{children}</div>
  )
}
