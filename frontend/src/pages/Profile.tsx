import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Settings, RefreshCw, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProfileCard } from '@/components/ProfileCard'
import { ProfileDescription } from '@/components/ProfileDescription'
import { StatsBar } from '@/components/StatsBar'
import { LanguageBar } from '@/components/LanguageBar'
import { RepoList } from '@/components/RepoList'
import { Heatmap } from '@/components/Heatmap'
import { useAuth } from '@/hooks/useAuth'
import { buildProfileThemeVars } from '@/lib/utils'
import {
  getProfile,
  getRankedRepos,
  getLanguages,
  getSettings,
  getStats,
  getHeatmap,
  refreshProfile,
  updateSettings,
} from '@/lib/api'
import type { UserProfile, Repo, Languages, UserSettings, UserStats } from '@/lib/api'

export function Profile() {
  const { username } = useParams<{ username: string }>()
  const navigate = useNavigate()
  const { isLoggedIn, username: authUsername } = useAuth()

  const isOwner = isLoggedIn && authUsername === username

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [repos, setRepos] = useState<Repo[]>([])
  const [languages, setLanguages] = useState<Languages>({})
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [heatmapData, setHeatmapData] = useState<Record<string, number>>({})

  useEffect(() => {
    return () => {
      document.body.style.removeProperty('background-color')
    }
  }, [])

  const loadData = useCallback(async () => {
    if (!username) return
    setLoading(true)
    setError(null)

    try {
      const [profileData, reposData, langsData, settingsData, statsData, heatData] =
        await Promise.allSettled([
          getProfile(username),
          getRankedRepos(username),
          getLanguages(username),
          getSettings(username),
          getStats(username),
          getHeatmap(username),
        ])

      if (profileData.status === 'rejected') {
        setError(`User "${username}" not found or the server is unavailable.`)
        return
      }

      setProfile(profileData.value)
      if (reposData.status === 'fulfilled') setRepos(reposData.value)
      if (langsData.status === 'fulfilled') setLanguages(langsData.value)
      if (settingsData.status === 'fulfilled') {
        const s = settingsData.value
        setSettings(s)
        document.body.style.backgroundColor = s.background ?? '#0d1117'
      }
      if (statsData.status === 'fulfilled') setStats(statsData.value)
      if (heatData.status === 'fulfilled') setHeatmapData(heatData.value.heatmap)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }, [username])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function handleRefresh() {
    if (!username) return
    setRefreshing(true)
    try {
      await refreshProfile(username)
      await loadData()
    } catch {
      // silently ignore
    } finally {
      setRefreshing(false)
    }
  }

  async function handleReorder(newOrder: string[]) {
    try {
      const updated = await updateSettings({ repo_order: newOrder })
      setSettings(updated)
    } catch {
      // optimistic UI already updated
    }
  }

  async function handleSetFeatured(name: string | null) {
    const prev = settings?.featured_repo ?? null
    setSettings((s) => s ? { ...s, featured_repo: name } : s)
    try {
      const updated = await updateSettings({ featured_repo: name ?? undefined })
      setSettings(updated)
    } catch {
      setSettings((s) => s ? { ...s, featured_repo: prev } : s)
    }
  }

  async function handleHideRepo(name: string) {
    const prev = settings?.hidden_repos ?? []
    if (prev.includes(name)) return
    const newHidden = [...prev, name]
    setSettings((s) => s ? { ...s, hidden_repos: newHidden } : s)
    try {
      const updated = await updateSettings({ hidden_repos: newHidden })
      setSettings(updated)
    } catch {
      setSettings((s) => s ? { ...s, hidden_repos: prev } : s)
    }
  }

  async function handleSaveRepoCustomization(name: string, desc: string, skills: string[]) {
    const newDescs = { ...(settings?.repo_descriptions ?? {}), [name]: desc }
    const newSkills = { ...(settings?.repo_skills ?? {}), [name]: skills }
    setSettings((s) => s ? { ...s, repo_descriptions: newDescs, repo_skills: newSkills } : s)
    try {
      const updated = await updateSettings({ repo_descriptions: newDescs, repo_skills: newSkills })
      setSettings(updated)
    } catch {
      // optimistic state remains
    }
  }

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" style={{ color: '#534AB7' }} />
          <span>Loading profile...</span>
        </div>
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </main>
    )
  }

  // ─── Error ─────────────────────────────────────────────────────────────────
  if (error || !profile) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h1 className="text-xl font-semibold">{error ?? 'Profile not found'}</h1>
          <Button variant="outline" onClick={() => navigate('/')}>Back to home</Button>
        </div>
      </main>
    )
  }

  const background    = settings?.background ?? '#0d1117'
  const accentColor   = settings?.accent_color ?? '#534AB7'
  const fontColor     = settings?.font_color ?? undefined
  const featuredRepo  = settings?.featured_repo ?? null
  const repoOrder     = settings?.repo_order ?? []
  const hiddenRepos   = settings?.hidden_repos ?? []
  const repoDescs     = settings?.repo_descriptions ?? {}
  const repoSkills    = settings?.repo_skills ?? {}
  const showBestBadge = settings?.show_scores ?? true
  const maxRepos      = settings?.max_repos ?? null
  const showLangBar   = settings?.show_language_bar ?? true
  const showHeatmap   = settings?.show_heatmap ?? true
  const profileDesc   = settings?.profile_description ?? ''

  const themeVars = buildProfileThemeVars(background, accentColor, fontColor, settings?.font ?? undefined)

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-6" style={themeVars}>
      {/* Owner controls */}
      {isOwner && (
        <div
          className="flex items-center justify-between rounded-lg border px-4 py-2 animate-fade-in"
          style={{ borderColor: `${accentColor}40`, backgroundColor: `${accentColor}0d` }}
        >
          <span className="text-sm font-medium" style={{ color: accentColor }}>Your profile</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
              <Settings className="h-3.5 w-3.5 mr-1.5" />
              Edit Settings
            </Button>
          </div>
        </div>
      )}

      {/* Profile Card */}
      <section>
        <ProfileCard profile={profile} settings={settings} />
      </section>

      {/* Stats */}
      {stats && (
        <section>
          <StatsBar stats={stats} />
        </section>
      )}

      {/* Profile Description */}
      {profileDesc && <ProfileDescription description={profileDesc} />}

      {/* Language Bar */}
      {showLangBar && Object.keys(languages).length > 0 && (
        <section
          className="rounded-xl border border-border bg-card p-5 animate-slide-up"
          style={{ animationDelay: '80ms' }}
        >
          <LanguageBar languages={languages} />
        </section>
      )}

      {/* Repos */}
      {repos.length > 0 && (
        <section>
          <RepoList
            repos={repos}
            featuredRepo={featuredRepo}
            repoOrder={repoOrder}
            hiddenRepos={hiddenRepos}
            repoDescriptions={repoDescs}
            repoSkills={repoSkills}
            isOwner={isOwner}
            showBestBadge={showBestBadge}
            maxRepos={maxRepos}
            onSetFeatured={isOwner ? handleSetFeatured : undefined}
            onReorder={handleReorder}
            onHideRepo={isOwner ? handleHideRepo : undefined}
            onSaveRepoCustomization={isOwner ? handleSaveRepoCustomization : undefined}
          />
        </section>
      )}

      {/* Heatmap */}
      {showHeatmap && Object.keys(heatmapData).length > 0 && (
        <section
          className="rounded-xl border border-border bg-card p-5 animate-slide-up"
          style={{ animationDelay: '150ms' }}
        >
          <Heatmap data={heatmapData} accentColor={accentColor} />
        </section>
      )}
    </main>
  )
}
