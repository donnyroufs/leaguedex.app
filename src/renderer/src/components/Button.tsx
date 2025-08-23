import { JSX, ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary'
type ButtonSize = 'sm' | 'md' | 'lg'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps): JSX.Element {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary disabled:opacity-50 disabled:cursor-not-allowed'

  const variantClasses = {
    primary:
      'bg-[rgba(0,255,136,0.1)] text-success border border-[rgba(0,255,136,0.3)] hover:bg-[rgba(0,255,136,0.2)] hover:border-[rgba(0,255,136,0.5)] transition-all duration-200',
    secondary:
      'bg-bg-secondary text-text-primary border border-border-primary hover:bg-bg-tertiary hover:border-border-accent focus:ring-border-accent/50'
  }

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  const classes =
    `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim()

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}
