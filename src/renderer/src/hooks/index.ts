import { useState } from 'react'
import { toast } from 'react-hot-toast'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useModal() {
  const [isOpen, setIsOpen] = useState(false)

  function onOpen(): void {
    setIsOpen(true)
  }

  function onClose(): void {
    setIsOpen(false)
  }

  return {
    onOpen,
    isOpen,
    onClose
  }
}

export function useToast(): {
  success: (message: string) => void
  error: (message: string) => void
} {
  const t = toast

  return {
    success(message: string) {
      t(message, {
        position: 'bottom-right'
      })
    },
    error(message: string) {
      t(message, {
        position: 'bottom-right'
      })
    }
  }
}
