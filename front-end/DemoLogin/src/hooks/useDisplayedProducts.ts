import { useMemo } from 'react'
import { useAppSelector } from '../store/hooks'
import type { Produit } from '../features/products/productsSlice'

/**
 * The product list after the active search, category filter and sort are
 * applied. Derived purely from the store, so any component that needs the
 * visible set can call this independently instead of receiving it as a prop.
 */
export function useDisplayedProducts(): Produit[] {
  const { items, search, sortBy, categoryFilter } = useAppSelector((s) => s.products)
  return useMemo(() => {
    let list = items.filter((p) =>
      (p.namePr ?? '').toLowerCase().includes(search.toLowerCase())
    )
    if (categoryFilter !== 'all') list = list.filter((p) => p.category?.NameCt === categoryFilter)
    switch (sortBy) {
      case 'newest':    return [...list].sort((a, b) => b.id - a.id)
      case 'oldest':    return [...list].sort((a, b) => a.id - b.id)
      case 'name-asc':  return [...list].sort((a, b) => a.namePr.localeCompare(b.namePr))
      case 'name-desc': return [...list].sort((a, b) => b.namePr.localeCompare(a.namePr))
    }
    return list
  }, [items, search, sortBy, categoryFilter])
}
