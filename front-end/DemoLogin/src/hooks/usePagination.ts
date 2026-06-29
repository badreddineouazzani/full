import { useState } from 'react'

/**
 * Client-side pagination over an in-memory list. Pass a `resetKey` (e.g. a
 * filter signature) and the current page jumps back to 1 whenever it changes —
 * done as a render-time state adjustment, the React-recommended alternative to
 * resetting state from an effect.
 */
export function usePagination<T>(items: T[], perPage: number, resetKey?: unknown) {
  const [page, setPage] = useState(1)
  const [lastResetKey, setLastResetKey] = useState(resetKey)

  if (resetKey !== lastResetKey) {
    setLastResetKey(resetKey)
    setPage(1)
  }

  const pageCount = Math.max(1, Math.ceil(items.length / perPage))
  const currentPage = Math.min(page, pageCount)
  const pageItems = items.slice((currentPage - 1) * perPage, currentPage * perPage)

  return { page: currentPage, pageCount, pageItems, setPage }
}
