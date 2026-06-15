import { MapPin, Building2, Users, BookOpen, Twitter, Linkedin, Globe, Github } from 'lucide-react'
import type { UserProfile, UserSettings } from '@/lib/api'

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  twitter:      <Twitter className="h-4 w-4" />,
  linkedin:     <Linkedin className="h-4 w-4" />,
  website:      <Globe className="h-4 w-4" />,
  github_extra: <Github className="h-4 w-4" />,
}

interface ProfileCardProps {
  profile: UserProfile
  settings: UserSettings | null
}

export function ProfileCard({ profile, settings }: ProfileCardProps) {
  const displayName = settings?.custom_name || profile.name || profile.login
  const displayBio = settings?.custom_bio || profile.bio

  return (
    <div className="flex flex-col sm:flex-row gap-6 items-start animate-fade-in">
      {/* Avatar */}
      <div className="flex-shrink-0">
        <img
          src={profile.avatar_url}
          alt={`${profile.login}'s avatar`}
          className="w-24 h-24 rounded-full border-2 border-border shadow-lg ring-2 ring-[var(--theme-accent,#534AB7)]/20 transition-transform duration-200 hover:scale-105"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-baseline gap-2">
          <h1 className="text-2xl font-bold text-foreground">{displayName}</h1>
          <span className="text-muted-foreground text-base">@{profile.login}</span>
          {profile.type === 'Organization' && (
            <span className="text-xs px-2 py-0.5 rounded-full border border-border text-muted-foreground">
              Org
            </span>
          )}
        </div>

        {displayBio && (
          <p className="mt-2 text-muted-foreground text-sm leading-relaxed">{displayBio}</p>
        )}

        <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
          {profile.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {profile.location}
            </span>
          )}
          {profile.company && (
            <span className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              {profile.company}
            </span>
          )}
        </div>

        {/* Social links */}
        {settings?.social_links && Object.keys(settings.social_links).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-3">
            {Object.entries(settings.social_links).map(([key, url]) => {
              if (!url) return null
              const href = url.startsWith('http') ? url : `https://${url}`
              return (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[var(--theme-accent,#534AB7)] transition-colors"
                  title={key}
                >
                  {SOCIAL_ICONS[key] ?? <Globe className="h-4 w-4" />}
                </a>
              )
            })}
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-5 text-sm">
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <strong className="text-foreground">{profile.followers.toLocaleString()}</strong>
            <span className="text-muted-foreground">followers</span>
          </span>
          <span className="flex items-center gap-1.5">
            <strong className="text-foreground">{profile.following.toLocaleString()}</strong>
            <span className="text-muted-foreground">following</span>
          </span>
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
            <strong className="text-foreground">{profile.public_repos.toLocaleString()}</strong>
            <span className="text-muted-foreground">repos</span>
          </span>
        </div>
      </div>
    </div>
  )
}
