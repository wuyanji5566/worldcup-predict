import { useCallback } from 'react'
import { useCommentStore } from '@/store/commentStore'
import { useAuthStore } from '@/store/authStore'

export function useComments(matchId: string) {
  const user = useAuthStore((s) => s.currentUser)
  const getComments = useCommentStore((s) => s.getComments)
  const addComment = useCommentStore((s) => s.addComment)
  const deleteComment = useCommentStore((s) => s.deleteComment)

  const comments = getComments(matchId)

  const submitComment = useCallback(
    (text: string) => {
      if (!user) return
      addComment(matchId, user.id, user.displayName, text)
    },
    [matchId, user, addComment],
  )

  const removeComment = useCallback(
    (commentId: string) => {
      deleteComment(matchId, commentId)
    },
    [matchId, deleteComment],
  )

  return { comments, submitComment, removeComment, currentUserId: user?.id }
}
