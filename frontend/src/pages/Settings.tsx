import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Save, RotateCcw, ArrowLeft, Eye, Globe } from 'lucide-react'
import { XIcon, LinkedinIcon, GithubIcon } from '@/components/BrandIcons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { applyTheme, detectBgMode, type BgMode } from '@/lib/utils'
import { getSettings, updateSettings, resetSettings } from '@/lib/api'

interface SocialLinks {
  twitter: string
  linkedin: string
  website: string
  github_extra: string
}

interface SettingsForm {
  custom_name: string
  custom_bio: string
  profile_description: string
  accent_color: string
  background: string
  font_color: string
  font: string
  show_language_bar: boolean
  show_heatmap: boolean
  show_scores: boolean
  max_repos: string
}

interface Template {
  name: string
  accent_color: string
  background: string
  font_color: string
  font: string
}

const TEMPLATES: Template[] = [
  { name: 'Default',  accent_color: '#534AB7', background: '#0d1117', font_color: '#c9d1d9', font: 'sans' },
  { name: 'Violet',   accent_color: '#7c3aed', background: '#0a0a0f', font_color: '#e2e8f0', font: 'sans' },
  { name: 'Ocean',    accent_color: '#0ea5e9', background: '#0f172a', font_color: '#bae6fd', font: 'mono' },
  { name: 'Forest',   accent_color: '#22c55e', background: '#0d1f12', font_color: '#bbf7d0', font: 'sans' },
  { name: 'Rose',     accent_color: '#f43f5e', background: '#1a0a0e', font_color: '#fecdd3', font: 'serif' },
  { name: 'Amber',    accent_color: '#f59e0b', background: '#1c1409', font_color: '#fde68a', font: 'mono' },
]

const DEFAULT_SOCIAL: SocialLinks = { twitter: '', linkedin: '', website: '', github_extra: '' }

const DEFAULTS: SettingsForm = {
  custom_name: '',
  custom_bio: '',
  profile_description: '',
  accent_color: '#534AB7',
  background: '#0d1117',
  font_color: '#c9d1d9',
  font: 'sans',
  show_language_bar: true,
  show_heatmap: true,
  show_scores: true,
  max_repos: '',
}

export function Settings() {
  const { isLoggedIn, username } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<SettingsForm>(DEFAULTS)
  const [bgMode, setBgMode] = useState<BgMode>('color')
  const [hiddenRepos, setHiddenRepos] = useState<string[]>([])
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(DEFAULT_SOCIAL)

  useEffect(() => {
    if (!isLoggedIn) navigate('/')
  }, [isLoggedIn, navigate])

  useEffect(() => {
    if (!username) return
    getSettings(username)
      .then((s) => {
        const bg = s.background ?? '#0d1117'
        setForm({
          custom_name: s.custom_name ?? '',
          custom_bio: s.custom_bio ?? '',
          profile_description: s.profile_description ?? '',
          accent_color: s.accent_color ?? '#534AB7',
          background: bg,
          font_color: s.font_color ?? '#c9d1d9',
          font: s.font ?? 'sans',
          show_language_bar: s.show_language_bar,
          show_heatmap: s.show_heatmap,
          show_scores: s.show_scores,
          max_repos: s.max_repos ? String(s.max_repos) : '',
        })
        setBgMode(detectBgMode(bg))
        setHiddenRepos(s.hidden_repos ?? [])
        const rawSl = s.social_links
        const sl: Record<string, string> =
          typeof rawSl === 'string'
            ? (() => { try { return JSON.parse(rawSl) } catch { return {} } })()
            : (rawSl ?? {})
        setSocialLinks({
          twitter:      sl.twitter      ?? '',
          linkedin:     sl.linkedin     ?? '',
          website:      sl.website      ?? '',
          github_extra: sl.github_extra ?? '',
        })
        applyTheme(s.accent_color ?? undefined, s.background ?? undefined, s.font ?? undefined, s.font_color ?? undefined)
      })
      .catch(() => setError('Failed to load current settings.'))
      .finally(() => setLoading(false))
  }, [username])

  function setField<K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSuccess(null)
    setError(null)

    if (key === 'accent_color' || key === 'background' || key === 'font' || key === 'font_color') {
      const updated = { ...form, [key]: value }
      applyTheme(updated.accent_color, updated.background, updated.font, updated.font_color)
    }
  }

  function setSocialField(key: keyof SocialLinks, value: string) {
    setSocialLinks((prev) => ({ ...prev, [key]: value }))
    setSuccess(null)
    setError(null)
  }

  function applyTemplate(t: Template) {
    setField('accent_color', t.accent_color)
    setField('background', t.background)
    setField('font_color', t.font_color)
    setField('font', t.font)
    setBgMode('color')
    applyTheme(t.accent_color, t.background, t.font, t.font_color)
  }

  function switchBgMode(mode: BgMode) {
    setBgMode(mode)
    if (mode === 'color') {
      setField('background', '#0d1117')
      applyTheme(form.accent_color, '#0d1117', form.font, form.font_color)
    } else if (mode === 'gradient') {
      const grad = 'linear-gradient(135deg, #0d1117 0%, #1a0a2e 100%)'
      setField('background', grad)
      applyTheme(form.accent_color, grad, form.font, form.font_color)
    } else {
      setField('background', '')
    }
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const maxReposNum = form.max_repos.trim() === '' ? null : parseInt(form.max_repos, 10)
      const cleanedLinks: Record<string, string> = {}
      if (socialLinks.twitter.trim())      cleanedLinks.twitter      = socialLinks.twitter.trim()
      if (socialLinks.linkedin.trim())     cleanedLinks.linkedin     = socialLinks.linkedin.trim()
      if (socialLinks.website.trim())      cleanedLinks.website      = socialLinks.website.trim()
      if (socialLinks.github_extra.trim()) cleanedLinks.github_extra = socialLinks.github_extra.trim()
      await updateSettings({
        custom_name: form.custom_name || undefined,
        custom_bio: form.custom_bio || undefined,
        profile_description: form.profile_description || undefined,
        accent_color: form.accent_color,
        background: form.background,
        font_color: form.font_color,
        font: form.font,
        show_language_bar: form.show_language_bar,
        show_heatmap: form.show_heatmap,
        show_scores: form.show_scores,
        max_repos: maxReposNum,
        social_links: cleanedLinks,
      })
      applyTheme(form.accent_color, form.background, form.font, form.font_color)
      setSuccess('Settings saved! Redirecting…')
      setTimeout(() => navigate(`/${username}`), 900)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  async function handleReset() {
    setResetting(true)
    setError(null)
    setSuccess(null)
    try {
      await resetSettings()
      setForm(DEFAULTS)
      setHiddenRepos([])
      setSocialLinks(DEFAULT_SOCIAL)
      applyTheme(DEFAULTS.accent_color, DEFAULTS.background, DEFAULTS.font, DEFAULTS.font_color)
      setSuccess('Settings reset to defaults.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset settings.')
    } finally {
      setResetting(false)
    }
  }

  async function handleUnhideRepo(name: string) {
    const newHidden = hiddenRepos.filter((r) => r !== name)
    setHiddenRepos(newHidden)
    try {
      await updateSettings({ hidden_repos: newHidden })
    } catch {
      setHiddenRepos(hiddenRepos)
    }
  }

  if (loading) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-10 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--theme-accent,#534AB7)' }} />
      </main>
    )
  }

  const accentColor = form.accent_color

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/${username}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Profile Settings</h1>
          <p className="text-sm text-muted-foreground">Customise how your profile appears</p>
        </div>
      </div>

      {success && (
        <div className="rounded-md bg-emerald-950 border border-emerald-700 px-4 py-3 text-sm text-emerald-300 animate-scale-in">
          {success}
        </div>
      )}
      {error && (
        <div className="rounded-md bg-red-950 border border-red-700 px-4 py-3 text-sm text-red-300 animate-scale-in">
          {error}
        </div>
      )}

      {/* Identity */}
      <Card>
        <CardHeader>
          <CardTitle>Identity</CardTitle>
          <CardDescription>Override your name and bio</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="custom_name">Display Name</Label>
            <Input
              id="custom_name"
              value={form.custom_name}
              onChange={(e) => setField('custom_name', e.target.value)}
              placeholder="Leave blank to use GitHub name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="custom_bio">Custom Bio</Label>
            <Textarea
              id="custom_bio"
              value={form.custom_bio}
              onChange={(e) => setField('custom_bio', e.target.value)}
              placeholder="Leave blank to use GitHub bio"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Profile Description */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Description</CardTitle>
          <CardDescription>
            A longer bio shown below your stats — supports Markdown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            id="profile_description"
            value={form.profile_description}
            onChange={(e) => setField('profile_description', e.target.value)}
            placeholder="Write about yourself, your projects, interests… Markdown supported."
            rows={6}
          />
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle>Social Links</CardTitle>
          <CardDescription>Links shown as icons on your profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sl_twitter" className="flex items-center gap-1.5">
              <XIcon className="h-3.5 w-3.5" /> Twitter / X
            </Label>
            <Input
              id="sl_twitter"
              value={socialLinks.twitter}
              onChange={(e) => setSocialField('twitter', e.target.value)}
              placeholder="https://x.com/yourhandle"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sl_linkedin" className="flex items-center gap-1.5">
              <LinkedinIcon className="h-3.5 w-3.5" /> LinkedIn
            </Label>
            <Input
              id="sl_linkedin"
              value={socialLinks.linkedin}
              onChange={(e) => setSocialField('linkedin', e.target.value)}
              placeholder="https://linkedin.com/in/yourname"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sl_website" className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" /> Personal Site
            </Label>
            <Input
              id="sl_website"
              value={socialLinks.website}
              onChange={(e) => setSocialField('website', e.target.value)}
              placeholder="https://yoursite.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sl_github_extra" className="flex items-center gap-1.5">
              <GithubIcon className="h-3.5 w-3.5" /> Second GitHub / Org
            </Label>
            <Input
              id="sl_github_extra"
              value={socialLinks.github_extra}
              onChange={(e) => setSocialField('github_extra', e.target.value)}
              placeholder="https://github.com/your-org"
            />
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Colors and typography — applied only on your profile page</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">

          {/* Template presets */}
          <div className="space-y-2">
            <Label>Templates</Label>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => applyTemplate(t)}
                  title={t.name}
                  className="group flex flex-col items-center gap-1 rounded-md border border-border p-1.5 text-[10px] text-muted-foreground hover:border-[var(--theme-accent)] transition-colors"
                >
                  <span
                    className="flex h-7 w-14 rounded overflow-hidden border border-border"
                  >
                    <span className="flex-1" style={{ backgroundColor: t.background }} />
                    <span className="w-3" style={{ backgroundColor: t.accent_color }} />
                  </span>
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 items-start">
            <div className="space-y-2">
              <Label>Highlight Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.accent_color}
                  onChange={(e) => setField('accent_color', e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded-md border border-input p-0.5"
                />
                <span className="text-xs text-muted-foreground font-mono">{form.accent_color}</span>
              </div>
              <div className="h-2.5 rounded-full" style={{ backgroundColor: form.accent_color }} />
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Background</Label>
              {/* Mode tabs */}
              <div className="flex rounded-md border border-input overflow-hidden text-xs w-fit">
                {(['color', 'gradient', 'image'] as BgMode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => switchBgMode(m)}
                    className={`px-3 py-1.5 capitalize transition-colors ${bgMode === m ? 'bg-[var(--theme-accent,#534AB7)] text-white' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {m === 'image' ? 'Image URL' : m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>

              {bgMode === 'color' && (
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.background.startsWith('#') ? form.background : '#0d1117'}
                    onChange={(e) => {
                      setField('background', e.target.value)
                      applyTheme(form.accent_color, e.target.value, form.font, form.font_color)
                    }}
                    className="h-10 w-14 cursor-pointer rounded-md border border-input p-0.5"
                  />
                  <span className="text-xs text-muted-foreground font-mono">{form.background}</span>
                </div>
              )}

              {bgMode === 'gradient' && (
                <div className="space-y-2">
                  <Input
                    value={form.background}
                    onChange={(e) => {
                      setField('background', e.target.value)
                      applyTheme(form.accent_color, e.target.value, form.font, form.font_color)
                    }}
                    placeholder="linear-gradient(135deg, #0d1117 0%, #1a0a2e 100%)"
                    className="font-mono text-xs"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'linear-gradient(135deg, #0d1117 0%, #1a0a2e 100%)',
                      'linear-gradient(135deg, #0f172a 0%, #0a2020 100%)',
                      'linear-gradient(to bottom, #0d1409 0%, #0a1420 100%)',
                      'radial-gradient(ellipse at top, #1a0a2e 0%, #0d1117 60%)',
                    ].map((g) => (
                      <button
                        key={g}
                        type="button"
                        title={g}
                        onClick={() => {
                          setField('background', g)
                          applyTheme(form.accent_color, g, form.font, form.font_color)
                        }}
                        className="h-6 w-16 rounded border border-border hover:border-[var(--theme-accent)] transition-colors"
                        style={{ backgroundImage: g }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {bgMode === 'image' && (
                <Input
                  value={form.background}
                  onChange={(e) => {
                    setField('background', e.target.value)
                    applyTheme(form.accent_color, e.target.value, form.font, form.font_color)
                  }}
                  placeholder="https://example.com/background.jpg"
                />
              )}

              <div
                className="h-2.5 rounded-full border border-border"
                style={
                  bgMode === 'color'
                    ? { backgroundColor: form.background }
                    : bgMode === 'gradient'
                    ? { backgroundImage: form.background }
                    : { backgroundImage: `url(${form.background})`, backgroundSize: 'cover' }
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Font Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.font_color}
                  onChange={(e) => setField('font_color', e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded-md border border-input p-0.5"
                />
                <span className="text-xs text-muted-foreground font-mono">{form.font_color}</span>
              </div>
              <div
                className="h-2.5 rounded-full border border-border flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: form.background }}
              >
                <span className="text-[8px] font-bold leading-none" style={{ color: form.font_color }}>Aa</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Font Family</Label>
              <Select value={form.font} onValueChange={(v) => setField('font', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sans">Sans-serif</SelectItem>
                  <SelectItem value="serif">Serif</SelectItem>
                  <SelectItem value="mono">Monospace</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Live preview strip */}
          <div
            className="rounded-md border p-3 text-sm"
            style={{
              backgroundColor: form.background,
              color: form.font_color,
              borderColor: `${accentColor}40`,
            }}
          >
            <span style={{ color: accentColor, fontWeight: 600 }}>Highlight</span>
            {' '}— profile preview with your chosen colors and font.
          </div>
        </CardContent>
      </Card>

      {/* Sections & Repos */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Sections</CardTitle>
          <CardDescription>Control what appears on your profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Language Bar</p>
              <p className="text-xs text-muted-foreground">Show language usage breakdown</p>
            </div>
            <Switch checked={form.show_language_bar} onCheckedChange={(v) => setField('show_language_bar', v)} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Activity Heatmap</p>
              <p className="text-xs text-muted-foreground">Show last 90-day activity grid</p>
            </div>
            <Switch checked={form.show_heatmap} onCheckedChange={(v) => setField('show_heatmap', v)} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Best Repo Badge</p>
              <p className="text-xs text-muted-foreground">Highlight your highest-scored repository</p>
            </div>
            <Switch checked={form.show_scores} onCheckedChange={(v) => setField('show_scores', v)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_repos">Max Repositories</Label>
            <Input
              id="max_repos"
              type="number"
              min="1"
              value={form.max_repos}
              onChange={(e) => setField('max_repos', e.target.value)}
              placeholder="Leave blank to show all"
              className="max-w-[160px]"
            />
            <p className="text-xs text-muted-foreground">Pinned repos count towards this limit</p>
          </div>
        </CardContent>
      </Card>

      {/* Hidden Repositories */}
      {hiddenRepos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Hidden Repositories</CardTitle>
            <CardDescription>These repos are hidden from your profile. Click to restore.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {hiddenRepos.map((name) => (
              <div
                key={name}
                className="flex items-center justify-between rounded-md border border-border px-3 py-2"
              >
                <span className="text-sm font-mono text-foreground">{name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUnhideRepo(name)}
                  className="gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Restore
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pb-8">
        <Button
          className="flex-1"
          onClick={handleSave}
          disabled={saving}
          style={{ backgroundColor: accentColor }}
        >
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
        <Button variant="outline" onClick={handleReset} disabled={resetting}>
          {resetting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RotateCcw className="h-4 w-4 mr-2" />}
          Reset
        </Button>
      </div>
    </main>
  )
}
