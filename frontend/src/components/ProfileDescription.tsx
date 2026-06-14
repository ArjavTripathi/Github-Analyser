import { MarkdownRenderer } from './MarkdownRenderer'

interface ProfileDescriptionProps {
  description: string
}

export function ProfileDescription({ description }: ProfileDescriptionProps) {
  if (!description.trim()) return null

  return (
    <section
      className="rounded-lg border border-border bg-card p-5 animate-slide-up"
      style={{ animationDelay: '150ms' }}
    >
      <MarkdownRenderer className="text-foreground/90">{description}</MarkdownRenderer>
    </section>
  )
}
