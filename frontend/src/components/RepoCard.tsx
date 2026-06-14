import { useState } from 'react'
import { Star, GitFork, ExternalLink, EyeOff, Pencil, X, Check, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Repo } from '@/lib/api'

interface RepoCardProps {
  repo: Repo
  isFeatured?: boolean
  isBest?: boolean
  isOwner: boolean
  showBestBadge: boolean
  customDescription?: string
  customSkills?: string[]
  onSetFeatured?: (name: string) => void
  onUnfeature?: () => void
  onHide?: (name: string) => void
  onSaveCustomization?: (desc: string, skills: string[]) => void
}

export function RepoCard({
  repo,
  isFeatured = false,
  isBest = false,
  isOwner,
  showBestBadge,
  customDescription,
  customSkills,
  onSetFeatured,
  onUnfeature,
  onHide,
  onSaveCustomization,
}: RepoCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editDesc, setEditDesc] = useState(customDescription ?? '')
  const [editSkillsRaw, setEditSkillsRaw] = useState((customSkills ?? []).join(', '))

  function handleSave() {
    const skills = editSkillsRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    onSaveCustomization?.(editDesc, skills)
    setIsEditing(false)
  }

  function handleCancel() {
    setEditDesc(customDescription ?? '')
    setEditSkillsRaw((customSkills ?? []).join(', '))
    setIsEditing(false)
  }

  return (
    <div
      className={cn(
        'group relative rounded-xl border bg-card transition-all duration-200',
        isFeatured
          ? 'border-[var(--theme-accent,#534AB7)]/50 shadow-xl shadow-[var(--theme-accent,#534AB7)]/10 p-6'
          : 'border-border p-4 hover:border-[var(--theme-accent,#534AB7)]/40 hover:shadow-md hover:shadow-[var(--theme-accent,#534AB7)]/8 hover:scale-[1.01]',
      )}
      style={
        isFeatured
          ? { backgroundImage: `linear-gradient(135deg, hsl(var(--card)) 0%, color-mix(in srgb, hsl(var(--card)) 85%, var(--theme-accent,#534AB7)) 100%)` }
          : undefined
      }
    >
      {/* Featured accent bar */}
      {isFeatured && (
        <div
          className="absolute inset-x-0 top-0 h-0.5 rounded-t-xl"
          style={{ background: `linear-gradient(90deg, transparent, var(--theme-accent,#534AB7), transparent)` }}
        />
      )}

      <div className={isFeatured ? '' : ''}>
        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
            {showBestBadge && isBest && (
              <Badge
                className="shrink-0 text-xs font-semibold border-0"
                style={{
                  backgroundColor: `color-mix(in srgb, var(--theme-accent,#534AB7) 20%, transparent)`,
                  color: 'var(--theme-accent,#534AB7)',
                }}
              >
                ★ Best Repo
              </Badge>
            )}
            {isFeatured && (
              <Badge variant="secondary" className="shrink-0 text-xs">
                Featured
              </Badge>
            )}
            <a
              href={repo.htmlurl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'font-semibold text-foreground hover:text-[var(--theme-accent,#534AB7)] transition-colors truncate flex items-center gap-1',
                isFeatured ? 'text-lg' : 'text-base',
              )}
            >
              {repo.name}
              <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity shrink-0" />
            </a>
            {repo.fork && (
              <span className="text-xs text-muted-foreground shrink-0">fork</span>
            )}
          </div>

          {/* Owner actions */}
          {isOwner && (
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setIsEditing((v) => !v)}
                title="Edit description & skills"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              {isFeatured ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground"
                  onClick={onUnfeature}
                  title="Remove featured (auto-select best)"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onSetFeatured?.(repo.name)}
                  title="Set as featured repo"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                </Button>
              )}
              {!isFeatured && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  onClick={() => onHide?.(repo.name)}
                  title="Hide this repo"
                >
                  <EyeOff className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* ── GitHub description ─────────────────────────────────────────── */}
        {repo.description && (
          <p className={cn('text-muted-foreground line-clamp-2', isFeatured ? 'mt-2 text-sm' : 'mt-1.5 text-sm')}>
            {repo.description}
          </p>
        )}

        {/* ── Custom description ─────────────────────────────────────────── */}
        {!isEditing && customDescription && (
          <p
            className="mt-2 text-sm leading-relaxed"
            style={{ color: 'var(--theme-accent,#534AB7)', opacity: 0.9 }}
          >
            {customDescription}
          </p>
        )}

        {/* ── Topics ─────────────────────────────────────────────────────── */}
        {repo.topics.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {repo.topics.slice(0, isFeatured ? 8 : 5).map((topic) => (
              <span
                key={topic}
                className="text-xs px-2 py-0.5 rounded-full bg-[var(--theme-accent,#534AB7)]/10 text-[var(--theme-accent,#534AB7)] border border-[var(--theme-accent,#534AB7)]/20"
              >
                {topic}
              </span>
            ))}
          </div>
        )}

        {/* ── Custom skills ──────────────────────────────────────────────── */}
        {!isEditing && customSkills && customSkills.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {customSkills.map((skill) => (
              <span
                key={skill}
                className="text-xs px-2.5 py-0.5 rounded-full bg-card border border-border text-muted-foreground font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className={cn('flex flex-wrap items-center gap-4 text-xs text-muted-foreground', isFeatured ? 'mt-4' : 'mt-3')}>
          {repo.language && (
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#6366f1' }} />
              {repo.language}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5" />
            {repo.stars.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <GitFork className="h-3.5 w-3.5" />
            {repo.forks.toLocaleString()}
          </span>
          {repo.license && typeof repo.license === 'object' && (repo.license as { name?: string }).name && (
            <span className="truncate">{(repo.license as { name: string }).name}</span>
          )}
        </div>
      </div>

      {/* ── Inline edit panel ──────────────────────────────────────────────── */}
      {isEditing && (
        <div className="border-t border-border mt-4 pt-4 space-y-3 animate-slide-down">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Custom description</label>
            <textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              placeholder="Add a custom description…"
              rows={2}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Skills / tags <span className="opacity-60">(comma-separated)</span>
            </label>
            <input
              value={editSkillsRaw}
              onChange={(e) => setEditSkillsRaw(e.target.value)}
              placeholder="React, TypeScript, GraphQL…"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {editSkillsRaw.trim() && (
              <div className="flex flex-wrap gap-1 pt-0.5">
                {editSkillsRaw.split(',').map((s) => s.trim()).filter(Boolean).map((s) => (
                  <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-card border border-border text-muted-foreground">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1"
              style={{ backgroundColor: 'var(--theme-accent,#534AB7)' }}
              onClick={handleSave}
            >
              <Check className="h-3.5 w-3.5 mr-1.5" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>
              <X className="h-3.5 w-3.5 mr-1.5" />
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
