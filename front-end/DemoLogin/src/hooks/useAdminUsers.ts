import { useMemo } from 'react'
import { useAppSelector } from '../store/hooks'
import type { Role } from '../services/auth/roles'

/**
 * Admin users straight from the store, narrowed to the active name search, plus
 * role counts for the summary cards. Derived purely from the store, so any
 * component that needs them can call this independently instead of receiving
 * the data as props.
 */
export function useAdminUsers() {
  const { users, search, loading, error } = useAppSelector((s) => s.admin)

  const stats = useMemo(() => {
    const byRole: Record<Role, number> = { superadmin: 0, admin: 0, editor: 0, viewer: 0 }
    for (const u of users) byRole[u.role]++
    return { total: users.length, byRole }
  }, [users])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return q ? users.filter((u) => u.name.toLowerCase().includes(q)) : users
  }, [users, search])

  return { filtered, stats, search, loading, error }
}
