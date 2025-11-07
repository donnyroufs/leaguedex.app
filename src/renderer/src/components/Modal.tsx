import { JSX, useEffect, useRef } from 'react'
import { X } from 'lucide-react'

type ModalProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  fullscreen?: boolean
}

export function Modal({ isOpen, onClose, title, children, fullscreen = false }: ModalProps): JSX.Element | null {
  const modalRef = useRef<HTMLDivElement>(null)

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
    if (isOpen && modalRef.current) {
      modalRef.current.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className={`fixed inset-0 z-50 ${fullscreen ? '' : 'flex items-center justify-center'}`}>
      {!fullscreen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <div
        ref={modalRef}
        className={`bg-bg-secondary border border-border-primary shadow-2xl flex flex-col ${
          fullscreen
            ? 'absolute w-full top-[2rem] h-[calc(100vh-2rem)] rounded-none'
            : 'relative w-full max-w-6xl mx-4 rounded-xl max-h-[90vh]'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
      >
        <div className="flex items-center justify-between p-6 border-b border-border-primary flex-shrink-0">
          <h2 id="modal-title" className="text-lg font-semibold text-text-primary">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  )
}
