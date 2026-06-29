import { useEffect, useRef, useState } from 'react'

/**
 * UI state for the collapsible inline search box: open/close, autofocus on
 * open, and Escape-to-close. `onClose` runs whenever the box closes (e.g. to
 * clear the active query). The latest `onClose` is held in a ref so the global
 * key listener subscribes once instead of on every render.
 */
export function useInlineSearch(onClose?: () => void) {
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  })

  const close = () => {
    setOpen(false)
    onCloseRef.current?.()
  }

  // Focus the field once it appears.
  useEffect(() => {
    if (!open) return
    const id = setTimeout(() => inputRef.current?.focus(), 100)
    return () => clearTimeout(id)
  }, [open])

  // Close on Escape from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        onCloseRef.current?.()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return { open, setOpen, close, inputRef }
}
