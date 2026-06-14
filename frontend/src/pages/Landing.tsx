import { Link } from 'react-router-dom'
import { GitBranch, LogOut, BarChart2, Globe, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

const EXAMPLE_USER = 'torvalds'

const FEATURES = [
  {
    icon: <BarChart2 className="h-5 w-5" />,
    title: 'Repo Rankings',
    description: 'Repos scored and ranked by stars, forks, activity, and recency.',
  },
  {
    icon: <Globe className="h-5 w-5" />,
    title: 'Language Breakdown',
    description: 'A visual map of every language used across all public repositories.',
  },
  {
    icon: <Flame className="h-5 w-5" />,
    title: 'Activity Heatmap',
    description: 'See the last 90 days of GitHub events at a glance.',
  },
]

export function Landing() {
  const { isLoggedIn, username, logout } = useAuth()

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl space-y-12 text-center">

        {/* Hero */}
        <div className="space-y-5 animate-fade-in">
          {/* Logo */}
          <div className="flex justify-center">
            <div
              className="h-20 w-20 rounded-3xl flex items-center justify-center shadow-2xl"
              style={{
                backgroundColor: 'var(--theme-accent,#534AB7)',
                boxShadow: '0 0 60px color-mix(in srgb, var(--theme-accent,#534AB7) 40%, transparent)',
              }}
            >
              <GitBranch className="h-10 w-10 text-white" />
            </div>
          </div>

          <div>
            <h1 className="text-5xl font-extrabold tracking-tight text-foreground">
              GitHub{' '}
              <span style={{ color: 'var(--theme-accent,#534AB7)' }}>Analyser</span>
            </h1>
            <p className="mt-3 text-lg text-muted-foreground max-w-sm mx-auto leading-relaxed">
              A beautiful public profile for your GitHub — rankings, languages, and activity in one place.
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-slide-up"
          style={{ animationDelay: '100ms' }}
        >
          {isLoggedIn ? (
            <>
              <Button
                size="lg"
                className="w-full sm:w-auto px-8"
                style={{ backgroundColor: 'var(--theme-accent,#534AB7)' }}
                asChild
              >
                <Link to={`/${username}`}>View your profile →</Link>
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
                <Link to={`/${EXAMPLE_USER}`}>View example</Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-muted-foreground"
              >
                <LogOut className="h-4 w-4 mr-1.5" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                size="lg"
                className="w-full sm:w-auto px-8 gap-2"
                style={{ backgroundColor: 'var(--theme-accent,#534AB7)' }}
                asChild
              >
                <a href="http://localhost:8000/auth/login">
                  <GitBranch className="h-4 w-4" />
                  Login with GitHub
                </a>
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
                <Link to={`/${EXAMPLE_USER}`}>View example profile →</Link>
              </Button>
            </>
          )}
        </div>

        {/* Feature cards */}
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-slide-up"
          style={{ animationDelay: '200ms' }}
        >
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border bg-card p-5 text-left space-y-2 transition-all duration-200 hover:border-[var(--theme-accent,#534AB7)]/40 hover:shadow-md"
            >
              <div
                className="h-9 w-9 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'color-mix(in srgb, var(--theme-accent,#534AB7) 15%, transparent)' }}
              >
                <span style={{ color: 'var(--theme-accent,#534AB7)' }}>{f.icon}</span>
              </div>
              <p className="font-semibold text-sm text-foreground">{f.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>

        {/* Tagline */}
        <p
          className="text-xs text-muted-foreground animate-fade-in"
          style={{ animationDelay: '350ms' }}
        >
          Profiles are public. Your data stays on your own server.
        </p>
      </div>
    </main>
  )
}
