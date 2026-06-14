import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fontFamilyFromSetting(font?: string | null): string {
  if (font === 'serif') return 'Georgia, "Times New Roman", serif'
  if (font === 'mono') return 'ui-monospace, "Cascadia Code", monospace'
  return 'system-ui, -apple-system, sans-serif'
}

/** Detect whether a hex color is perceptually light (> 55% luminance). */
export function isHexLight(hex: string): boolean {
  if (!hex || hex.length < 7) return false
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55
}

/**
 * Build scoped CSS-variable overrides for the profile <main> container.
 * Switches card/border/muted vars so cards always look correct regardless
 * of whether the user chose a light or dark profile background.
 */
export function buildProfileThemeVars(
  background: string,
  accentColor: string,
  fontColor: string | undefined,
  font: string | undefined,
): React.CSSProperties {
  const light = isHexLight(background)
  return {
    '--theme-accent': accentColor,
    // card + foreground
    '--card': light ? '0 0% 100%' : '213 19% 11%',
    '--card-foreground': light ? '213 33% 10%' : '213 16% 82%',
    // popovers (dropdowns, tooltips)
    '--popover': light ? '0 0% 100%' : '213 19% 9%',
    '--popover-foreground': light ? '213 33% 10%' : '213 16% 82%',
    // borders & inputs
    '--border': light ? '220 13% 88%' : '213 13% 20%',
    '--input': light ? '220 13% 88%' : '213 13% 20%',
    // muted surfaces (skeleton, language bar bg, etc.)
    '--muted': light ? '210 40% 96%' : '213 13% 17%',
    '--muted-foreground': light ? '215 16% 47%' : '213 11% 52%',
    // interactive accent (hover bg for buttons/menu items)
    '--accent': light ? '210 40% 94%' : '213 13% 17%',
    '--accent-foreground': light ? '213 33% 10%' : '213 16% 82%',
    // secondary badges
    '--secondary': light ? '210 40% 94%' : '213 13% 17%',
    '--secondary-foreground': light ? '213 33% 10%' : '213 16% 72%',
    // primary buttons
    '--primary': light ? '250 84% 45%' : '250 84% 68%',
    '--primary-foreground': '0 0% 100%',
    // ring
    '--ring': light ? '250 84% 45%' : '250 84% 68%',
    // text & font
    color: fontColor,
    fontFamily: fontFamilyFromSetting(font),
  } as React.CSSProperties
}

/**
 * Apply theme to <html> — used by Settings page for live preview only.
 */
export function applyTheme(
  accentColor?: string,
  background?: string,
  font?: string,
  fontColor?: string,
) {
  const root = document.documentElement
  root.style.setProperty('--theme-accent', accentColor ?? '#534AB7')
  if (background) {
    document.body.style.backgroundColor = background
  } else {
    document.body.style.removeProperty('background-color')
  }
  if (fontColor) {
    root.style.color = fontColor
  } else {
    root.style.removeProperty('color')
  }
  root.style.setProperty('--app-font', fontFamilyFromSetting(font))
}

export function formatAccountAge(days: number): string {
  const years = Math.floor(days / 365)
  const months = Math.floor((days % 365) / 30)
  if (years > 0 && months > 0) return `${years}y ${months}mo`
  if (years > 0) return `${years} year${years !== 1 ? 's' : ''}`
  if (months > 0) return `${months} month${months !== 1 ? 's' : ''}`
  return `${days} days`
}

export function scoreColor(score: number): string {
  if (score > 0.5) return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
  if (score > 0.25) return 'bg-amber-500/15 text-amber-400 border-amber-500/30'
  return 'bg-muted text-muted-foreground border-border'
}

export const LANG_COLORS = [
  '#6366f1', '#f59e0b', '#10b981', '#ef4444',
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6',
  '#f97316', '#84cc16',
]
