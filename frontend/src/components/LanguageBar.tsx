import { useState } from 'react'
import { LANG_COLORS } from '@/lib/utils'
import type { Languages } from '@/lib/api'

interface LanguageBarProps {
  languages: Languages
}

export function LanguageBar({ languages }: LanguageBarProps) {
  const [tooltip, setTooltip] = useState<{ lang: string; pct: number; x: number; y: number } | null>(null)

  const entries = Object.entries(languages).sort((a, b) => b[1] - a[1])
  if (entries.length === 0) return null

  return (
    <div className="space-y-3 animate-slide-up" style={{ animationDelay: '120ms' }}>
      <h2 className="text-sm font-semibold text-foreground">Languages</h2>

      {/* Stacked bar */}
      <div className="relative flex h-4 w-full overflow-hidden rounded-full bg-muted">
        {entries.map(([lang, pct], i) => (
          <div
            key={lang}
            style={{
              width: `${pct}%`,
              backgroundColor: LANG_COLORS[i % LANG_COLORS.length],
            }}
            className="relative cursor-pointer transition-opacity hover:opacity-75"
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              setTooltip({ lang, pct, x: rect.left + rect.width / 2, y: rect.top - 8 })
            }}
            onMouseLeave={() => setTooltip(null)}
            title={`${lang}: ${pct.toFixed(1)}%`}
          />
        ))}
      </div>

      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full rounded bg-foreground px-2 py-1 text-xs text-background shadow"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.lang}: {tooltip.pct.toFixed(1)}%
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {entries.slice(0, 8).map(([lang, pct], i) => (
          <span key={lang} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="h-3 w-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: LANG_COLORS[i % LANG_COLORS.length] }}
            />
            {lang}
            <span className="text-foreground font-medium">{pct.toFixed(1)}%</span>
          </span>
        ))}
      </div>
    </div>
  )
}
