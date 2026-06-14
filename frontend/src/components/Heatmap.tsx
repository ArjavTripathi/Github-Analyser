interface HeatmapProps {
  data: Record<string, number>
  accentColor?: string
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

export function Heatmap({ data, accentColor = '#534AB7' }: HeatmapProps) {
  const rgb = hexToRgb(accentColor) ?? { r: 83, g: 74, b: 183 }

  // Build last 91 days (13 weeks × 7 days)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const days: { date: string; count: number }[] = []
  for (let i = 90; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    days.push({ date: key, count: data[key] ?? 0 })
  }

  const maxCount = Math.max(...days.map((d) => d.count), 1)

  // Pad start so first day aligns to correct weekday (0 = Sun)
  const firstDay = new Date(days[0].date).getDay()
  const padded = [...Array<null>(firstDay).fill(null), ...days]

  // Build 13 columns of 7 rows
  const weeks: ({ date: string; count: number } | null)[][] = []
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7) as ({ date: string; count: number } | null)[])
  }

  // Month labels: figure out which week column each month starts in
  const monthLabels: { col: number; label: string }[] = []
  let lastMonth = -1
  weeks.forEach((week, col) => {
    const firstValid = week.find((d) => d !== null)
    if (firstValid) {
      const m = new Date(firstValid.date).getMonth()
      if (m !== lastMonth) {
        lastMonth = m
        monthLabels.push({
          col,
          label: new Date(firstValid.date).toLocaleString('default', { month: 'short' }),
        })
      }
    }
  })

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  function cellColor(count: number): string {
    if (count === 0) return 'rgba(0,0,0,0.06)'
    const intensity = Math.min(0.15 + (count / maxCount) * 0.85, 1)
    return `rgba(${rgb.r},${rgb.g},${rgb.b},${intensity.toFixed(2)})`
  }

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-foreground">Activity (last 90 days)</h2>
      <div className="overflow-x-auto">
        <div style={{ display: 'grid', gridTemplateColumns: `28px repeat(${weeks.length}, 14px)`, gap: '2px', alignItems: 'start' }}>
          {/* Empty top-left corner */}
          <div />
          {/* Month labels row */}
          {weeks.map((_, col) => {
            const label = monthLabels.find((m) => m.col === col)
            return (
              <div key={col} className="text-[9px] text-muted-foreground h-4 flex items-center">
                {label?.label}
              </div>
            )
          })}

          {/* Day label + cells for each weekday row */}
          {DAYS.map((day, row) => (
            <>
              <div key={`day-${day}`} className="text-[9px] text-muted-foreground flex items-center pr-1" style={{ height: 14 }}>
                {row % 2 === 1 ? day.slice(0, 3) : ''}
              </div>
              {weeks.map((week, col) => {
                const cell = week[row]
                return (
                  <div
                    key={`${col}-${row}`}
                    title={cell ? `${cell.date}: ${cell.count} events` : undefined}
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 2,
                      backgroundColor: cell ? cellColor(cell.count) : 'transparent',
                    }}
                  />
                )
              })}
            </>
          ))}
        </div>
      </div>

      {/* Scale legend */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <span>Less</span>
        {[0, 0.25, 0.5, 0.75, 1].map((level) => (
          <div
            key={level}
            style={{
              width: 12,
              height: 12,
              borderRadius: 2,
              backgroundColor:
                level === 0
                  ? 'rgba(0,0,0,0.06)'
                  : `rgba(${rgb.r},${rgb.g},${rgb.b},${(0.15 + level * 0.85).toFixed(2)})`,
            }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}
