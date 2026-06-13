import { useComments } from '@/hooks/useComments'
import { useAuth } from '@/hooks/useAuth'
import { CommentForm } from './CommentForm'
import { CommentCard } from './CommentCard'
import { EmptyState } from '@/components/ui/EmptyState'

interface CommentThreadProps {
  matchId: string
}

export function CommentThread({ matchId }: CommentThreadProps) {
  const { comments, submitComment, removeComment, currentUserId } = useComments(matchId)
  const { isLoggedIn, openAuthModal } = useAuth()

  return (
    <div>
      <h3 className="text-sm font-semibold text-text mb-3">
        💬 讨论 ({comments.length})
      </h3>

      {isLoggedIn ? (
        <CommentForm onSubmit={submitComment} />
      ) : (
        <button
          onClick={() => openAuthModal('login')}
          className="w-full p-3 bg-bg-card border border-border rounded-xl text-sm text-text-muted hover:bg-bg-card-hover transition-colors cursor-pointer text-left"
        >
          登录后参与讨论...
        </button>
      )}

      <div className="mt-4 space-y-3">
        {comments.length === 0 ? (
          <EmptyState icon="💬" title="暂无评论" description="来抢沙发吧！" />
        ) : (
          comments.slice(0, 50).map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              isOwn={currentUserId === comment.userId}
              onDelete={() => removeComment(comment.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
