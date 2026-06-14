import { useState, useCallback } from 'react'

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('github_token'))
  const [username, setUsername] = useState<string | null>(() =>
    localStorage.getItem('github_username')
  )

  const isLoggedIn = !!token && !!username

  const login = useCallback((newToken: string, newUsername: string) => {
    localStorage.setItem('github_token', newToken)
    localStorage.setItem('github_username', newUsername)
    setToken(newToken)
    setUsername(newUsername)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('github_token')
    localStorage.removeItem('github_username')
    setToken(null)
    setUsername(null)
  }, [])

  return { token, username, isLoggedIn, login, logout }
}
