import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { clearError } from '../features/auth/authSlice'

/**
 * Shared state for the auth forms (login / register). Tracks a set of named
 * text fields, surfaces the async `{ loading, error }` from the auth slice, and
 * clears any lingering error when the page unmounts so it never leaks across
 * navigation. Submission stays in the page — it owns which request to dispatch.
 */
export function useAuthForm<T extends Record<string, string>>(initial: T) {
  const dispatch = useAppDispatch()
  const { loading, error } = useAppSelector((s) => s.auth)
  const [values, setValues] = useState<T>(initial)

  useEffect(() => () => { dispatch(clearError()) }, [dispatch])

  const setField = (name: keyof T) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [name]: e.target.value }))

  return { values, setField, loading, error }
}
