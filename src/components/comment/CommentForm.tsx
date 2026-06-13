import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface CommentFormProps {
  onSubmit: (text: string) => void
}

export function CommentForm({ onSubmit }: CommentFormProps) {
  const [text, setText] = useState('')

  const handleSubmit = () => {
    if (!text.trim()) return
    onSubmit(text)
    setText('')
  }

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder="发表你的看法..."
        maxLength={500}
        className="flex-1 px-4 py-2.5 bg-bg border border-border rounded-xl text-text placeholder:text-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 min-h-[48px]"
      />
      <Button
        variant="primary"
        size="sm"
        onClick={handleSubmit}
        disabled={!text.trim()}
        className="shrink-0"
      >
        发布
      </Button>
    </div>
  )
}
