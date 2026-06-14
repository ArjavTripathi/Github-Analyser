import ReactMarkdown from 'react-markdown'

interface MarkdownRendererProps {
  children: string
  className?: string
}

export function MarkdownRenderer({ children, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`md text-sm leading-relaxed ${className}`}>
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  )
}
