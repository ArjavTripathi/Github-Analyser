const BASE = 'http://localhost:8000'

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('github_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error')
    throw new Error(`HTTP ${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  login: string
  name: string
  avatar_url: string
  type: string
  location: string | null
  company: string | null
  bio: string | null
  public_repos: number
  followers: number
  following: number
  created_at: string
}

export interface Repo {
  name: string
  isPrivate: boolean
  owner: string
  htmlurl: string
  fork: boolean
  pushtime: string
  createdtime: string
  topics: string[]
  size: number
  license: string | null
  open_issues_count: number
  stars: number
  forks: number
  description: string | null
  language: string | null
  score: number
}

export interface Languages {
  [language: string]: number
}

export interface UserSettings {
  github_username: string
  custom_name: string | null
  accent_color: string | null
  background: string | null
  font: string | null
  font_color: string | null
  show_language_bar: boolean
  show_heatmap: boolean
  show_scores: boolean
  max_repos: number | null
  custom_bio: string | null
  profile_description: string | null
  featured_repo: string | null
  repo_order: string[]
  hidden_repos: string[]
  repo_descriptions: Record<string, string>
  repo_skills: Record<string, string[]>
}

export interface UserStats {
  total_stars: number
  total_forks: number
  most_used_language: string | null
  account_age_days: number
  public_repos: number
  followers: number
}

export interface Heatmap {
  heatmap: Record<string, number>
}

// ─── API Functions ────────────────────────────────────────────────────────────

export async function getProfile(username: string): Promise<UserProfile> {
  const res = await fetch(`${BASE}/profile/${username}`)
  return handleResponse<UserProfile>(res)
}

export async function getRankedRepos(username: string): Promise<Repo[]> {
  const res = await fetch(`${BASE}/profile/${username}/rankrepos`)
  return handleResponse<Repo[]>(res)
}

export async function getLanguages(username: string): Promise<Languages> {
  const res = await fetch(`${BASE}/profile/${username}/languages`)
  return handleResponse<Languages>(res)
}

export async function getSettings(username: string): Promise<UserSettings> {
  const res = await fetch(`${BASE}/profile/${username}/settings`)
  return handleResponse<UserSettings>(res)
}

export async function getStats(username: string): Promise<UserStats> {
  const res = await fetch(`${BASE}/profile/${username}/stats`)
  return handleResponse<UserStats>(res)
}

export async function getHeatmap(username: string): Promise<Heatmap> {
  const res = await fetch(`${BASE}/profile/${username}/heatmap`)
  return handleResponse<Heatmap>(res)
}

export async function updateSettings(
  data: Partial<Omit<UserSettings, 'github_username'>>
): Promise<UserSettings> {
  const res = await fetch(`${BASE}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  return handleResponse<UserSettings>(res)
}

export async function resetSettings(): Promise<void> {
  const res = await fetch(`${BASE}/settings/reset`, {
    method: 'POST',
    headers: authHeaders(),
  })
  return handleResponse<void>(res)
}

export async function refreshProfile(username: string): Promise<void> {
  const res = await fetch(`${BASE}/profile/${username}/refresh`, {
    method: 'POST',
    headers: authHeaders(),
  })
  return handleResponse<void>(res)
}
