import type { Comment } from '@/types/comment'
import { formatRelative } from '@/utils/time'
import { Trash2 } from 'lucide-react'

interface CommentCardProps {
  comment: Comment
  isOwn: boolean
  onDelete: () => void
}

export function CommentCard({ comment, isOwn, onDelete }: CommentCardProps) {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-3 group">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-sm font-bold text-accent">
            {comment.username.charAt(0)}
          </span>
          <span className="text-sm font-medium text-text">{comment.username}</span>
          <span className="text-xs text-text-muted">{formatRelative(comment.createdAt)}</span>
        </div>
        {isOwn && (
          <button
            onClick={onDelete}
            className="opacity-0 group-hover:opacity-100 p-1 rounded text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
      <p className="text-sm text-text leading-relaxed">{comment.text}</p>
    </div>
  )
}
