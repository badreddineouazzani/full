import { useEffect, useState } from 'react'

/**
 * Dark/light theme toggle. Persists the choice to localStorage and reflects it
 * on `<html data-theme>` so the whole app re-themes through CSS variables.
 */
export function useDarkMode() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    const theme = dark ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [dark])

  return { dark, toggle: () => setDark((d) => !d) }
}
