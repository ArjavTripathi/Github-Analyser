import { Star, GitFork, Code, Calendar } from 'lucide-react'
import { formatAccountAge } from '@/lib/utils'
import type { UserStats } from '@/lib/api'

interface StatsBarProps {
  stats: UserStats
}

export function StatsBar({ stats }: StatsBarProps) {
  const items = [
    { icon: <Star className="h-4 w-4" />, label: 'Total Stars', value: stats.total_stars.toLocaleString() },
    { icon: <GitFork className="h-4 w-4" />, label: 'Total Forks', value: stats.total_forks.toLocaleString() },
    { icon: <Code className="h-4 w-4" />, label: 'Top Language', value: stats.most_used_language || 'N/A' },
    { icon: <Calendar className="h-4 w-4" />, label: 'Account Age', value: formatAccountAge(stats.account_age_days) },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map((item, i) => (
        <div
          key={item.label}
          className="flex flex-col items-center gap-1 rounded-lg border border-border bg-card p-4 text-center animate-slide-up transition-all duration-200 hover:scale-[1.03] hover:shadow-md hover:border-[var(--theme-accent,#534AB7)]/40"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <span className="text-[var(--theme-accent,#534AB7)]">{item.icon}</span>
          <span className="text-xl font-bold text-foreground">{item.value}</span>
          <span className="text-xs text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  )
}
