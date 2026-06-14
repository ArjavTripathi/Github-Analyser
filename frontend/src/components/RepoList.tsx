import { useState } from 'react'
import { GripVertical } from 'lucide-react'
import { RepoCard } from './RepoCard'
import { cn } from '@/lib/utils'
import type { Repo } from '@/lib/api'

interface RepoListProps {
  repos: Repo[]
  featuredRepo: string | null       // explicit override; null = auto-select best
  repoOrder: string[]
  hiddenRepos: string[]
  repoDescriptions: Record<string, string>
  repoSkills: Record<string, string[]>
  isOwner: boolean
  showBestBadge: boolean
  maxRepos: number | null
  onSetFeatured?: (name: string | null) => void
  onReorder?: (newOrder: string[]) => void
  onHideRepo?: (name: string) => void
  onSaveRepoCustomization?: (name: string, desc: string, skills: string[]) => void
}

export function RepoList({
  repos,
  featuredRepo,
  repoOrder,
  hiddenRepos,
  repoDescriptions,
  repoSkills,
  isOwner,
  showBestBadge,
  maxRepos,
  onSetFeatured,
  onReorder,
  onHideRepo,
  onSaveRepoCustomization,
}: RepoListProps) {
  const [localOrder, setLocalOrder] = useState<string[]>(repoOrder)
  const [dragFrom, setDragFrom] = useState<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)

  // Filter hidden, then sort
  const visible = repos.filter((r) => !hiddenRepos.includes(r.name))

  // Highest-scored repo
  const bestRepoName = visible.length > 0
    ? visible.reduce((a, b) => (b.score > a.score ? b : a)).name
    : null

  // Featured = explicit override or auto-select best
  const effectiveFeatured = featuredRepo ?? bestRepoName

  const featuredData = visible.find((r) => r.name === effectiveFeatured)

  // Build sorted list of non-featured repos
  let others = visible.filter((r) => r.name !== effectiveFeatured)
  if (localOrder.length > 0) {
    const orderMap = new Map(localOrder.map((name, i) => [name, i]))
    others = [...others].sort((a, b) => {
      const ai = orderMap.get(a.name) ?? Infinity
      const bi = orderMap.get(b.name) ?? Infinity
      return ai !== bi ? ai - bi : b.score - a.score
    })
  } else {
    others = [...others].sort((a, b) => b.score - a.score)
  }

  // Apply maxRepos limit (featured counts as 1)
  const limit = maxRepos && maxRepos > 0 ? maxRepos : Infinity
  const othersToShow = others.slice(0, Math.max(0, limit - (featuredData ? 1 : 0)))
  const hiddenByLimit = others.length - othersToShow.length

  // ── Drag to reorder ──────────────────────────────────────────────────────────

  function onDragStart(e: React.DragEvent, i: number) {
    setDragFrom(i)
    e.dataTransfer.effectAllowed = 'move'
  }

  function onDragOver(e: React.DragEvent, i: number) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOver(i)
  }

  function onDrop(e: React.DragEvent, i: number) {
    e.preventDefault()
    if (dragFrom === null || dragFrom === i) {
      setDragFrom(null); setDragOver(null); return
    }
    const reordered = [...othersToShow]
    const [moved] = reordered.splice(dragFrom, 1)
    reordered.splice(i, 0, moved)
    const newOrder = reordered.map((r) => r.name)
    setLocalOrder(newOrder)
    setDragFrom(null); setDragOver(null)
    onReorder?.(newOrder)
  }

  function onDragEnd() { setDragFrom(null); setDragOver(null) }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Featured repo — full-width, prominent */}
      {featuredData && (
        <section className="animate-slide-up" style={{ animationDelay: '50ms' }}>
          <RepoCard
            repo={featuredData}
            isFeatured
            isBest={featuredData.name === bestRepoName}
            isOwner={isOwner}
            showBestBadge={showBestBadge}
            customDescription={repoDescriptions[featuredData.name]}
            customSkills={repoSkills[featuredData.name]}
            onUnfeature={() => onSetFeatured?.(null)}
            onSaveCustomization={(d, s) => onSaveRepoCustomization?.(featuredData.name, d, s)}
          />
        </section>
      )}

      {/* All other repos */}
      {othersToShow.length > 0 && (
        <section className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">
              {featuredData ? 'Other Repositories' : 'Repositories'}
            </h2>
            {isOwner && othersToShow.length > 1 && (
              <span className="text-xs text-muted-foreground">Drag to reorder</span>
            )}
          </div>

          {isOwner ? (
            <div className="flex flex-col gap-2">
              {othersToShow.map((repo, i) => (
                <div
                  key={repo.name}
                  draggable
                  onDragStart={(e) => onDragStart(e, i)}
                  onDragOver={(e) => onDragOver(e, i)}
                  onDrop={(e) => onDrop(e, i)}
                  onDragEnd={onDragEnd}
                  className={cn(
                    'flex items-stretch gap-2 transition-opacity rounded-xl',
                    dragFrom === i && 'opacity-40',
                    dragOver === i && dragFrom !== i && 'ring-2 ring-[var(--theme-accent,#534AB7)] ring-offset-1',
                  )}
                >
                  <div className="flex items-center px-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors shrink-0">
                    <GripVertical className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <RepoCard
                      repo={repo}
                      isBest={repo.name === bestRepoName && repo.name !== effectiveFeatured}
                      isOwner
                      showBestBadge={showBestBadge}
                      customDescription={repoDescriptions[repo.name]}
                      customSkills={repoSkills[repo.name]}
                      onSetFeatured={onSetFeatured ?? undefined}
                      onHide={onHideRepo}
                      onSaveCustomization={(d, s) => onSaveRepoCustomization?.(repo.name, d, s)}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {othersToShow.map((repo) => (
                <RepoCard
                  key={repo.name}
                  repo={repo}
                  isBest={repo.name === bestRepoName && repo.name !== effectiveFeatured}
                  isOwner={false}
                  showBestBadge={showBestBadge}
                  customDescription={repoDescriptions[repo.name]}
                  customSkills={repoSkills[repo.name]}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {hiddenByLimit > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          {hiddenByLimit} more {hiddenByLimit === 1 ? 'repository' : 'repositories'} hidden by limit
        </p>
      )}
    </div>
  )
}
