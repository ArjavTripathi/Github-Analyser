import { Link, useNavigate, useLocation } from 'react-router-dom'
import { GitBranch, LogOut, Settings, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

const KNOWN_PATHS = new Set(['settings', 'auth'])

export function Navbar() {
  const { isLoggedIn, username, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Detect if we're on a profile page (/:username)
  const parts = location.pathname.split('/').filter(Boolean)
  const viewedUsername =
    parts.length === 1 && !KNOWN_PATHS.has(parts[0]) ? parts[0] : null

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold text-foreground hover:opacity-80 transition-opacity"
        >
          <GitBranch className="h-5 w-5" />
          <span>GitAnalyser</span>
        </Link>

        <nav className="flex items-center gap-1">
          {/* View on GitHub — shown on any profile page */}
          {viewedUsername && (
            <Button variant="ghost" size="sm" asChild className="gap-1.5 text-muted-foreground hover:text-foreground">
              <a
                href={`https://github.com/${viewedUsername}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                GitHub
              </a>
            </Button>
          )}

          {isLoggedIn ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to={`/${username}`}>@{username}</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/settings">
                  <Settings className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <a href="http://localhost:8000/auth/login">
                <GitBranch className="h-4 w-4 mr-1.5" />
                Login with GitHub
              </a>
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}
