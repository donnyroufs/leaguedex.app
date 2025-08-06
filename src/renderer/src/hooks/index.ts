import { useState } from 'react'

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
