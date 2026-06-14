/**
 * Auth Callback Page
 *
 * NOTE: The backend is expected to redirect to:
 *   http://localhost:5173/auth/callback?token=JWT&username=USERNAME
 * after completing the OAuth code exchange.
 *
 * If the backend currently returns JSON from /auth/callback instead of redirecting,
 * update the backend to redirect to:
 *   http://localhost:5173/auth/callback?token={token}&username={username}
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export function AuthCallback() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const username = params.get('username')

    if (token && username) {
      login(token, username)
      navigate(`/${username}`, { replace: true })
    } else {
      setError('Authentication failed — no token received. Please try again.')
    }
  }, [login, navigate])

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive font-medium">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="text-sm underline text-muted-foreground hover:text-foreground"
          >
            Back to home
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2
          className="mx-auto h-10 w-10 animate-spin"
          style={{ color: 'var(--theme-accent, #534AB7)' }}
        />
        <p className="text-foreground font-medium">Logging you in...</p>
        <p className="text-sm text-muted-foreground">Just a moment</p>
      </div>
    </main>
  )
}
