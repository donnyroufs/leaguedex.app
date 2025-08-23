import { JSX, useEffect, useRef } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from './Button'

type ConfirmDialogProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger'
}: ConfirmDialogProps): JSX.Element | null {
  const dialogRef = useRef<HTMLDivElement>(null)

  const getVariantStyles = (): { icon: JSX.Element; confirmButton: string } => {
    switch (variant) {
      case 'danger':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-error" />,
          confirmButton:
            'bg-error/10 text-error border-error/30 hover:bg-error/20 hover:border-error/50'
        }
      case 'warning':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-warning" />,
          confirmButton:
            'bg-warning/10 text-warning border-warning/30 hover:bg-warning/20 hover:border-warning/50'
        }
      case 'info':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-info" />,
          confirmButton: 'bg-info/10 text-info border-info/30 hover:bg-info/20 hover:border-info/50'
        }
    }
  }

  const styles = getVariantStyles()

  const handleConfirm = (): void => {
    onConfirm()
    onClose()
  }

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen && dialogRef.current) {
      dialogRef.current.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        className="relative bg-bg-secondary border border-border-primary rounded-xl shadow-2xl w-full max-w-sm min-w-[320px]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        tabIndex={-1}
      >
        <div className="p-6">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-16 h-16 bg-bg-primary rounded-full flex items-center justify-center border border-border-primary/20">
              {styles.icon}
            </div>

            <div className="space-y-2">
              <h2 id="confirm-title" className="text-text-primary text-lg font-medium">
                {title}
              </h2>
              <p className="text-text-secondary text-base">{message}</p>
            </div>

            <div className="flex items-center space-x-3 w-full">
              <Button variant="secondary" onClick={onClose} className="flex-1">
                {cancelText}
              </Button>
              <Button onClick={handleConfirm} className={`flex-1 border ${styles.confirmButton}`}>
                {confirmText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
