import { create } from 'zustand'
import type { Comment } from '@/types/comment'
import { getItem, setItem } from '@/utils/storage'
import { nanoid } from 'nanoid'

interface CommentStore {
  comments: Record<string, Comment[]>
  getComments: (matchId: string) => Comment[]
  addComment: (matchId: string, userId: string, username: string, text: string) => void
  deleteComment: (matchId: string, commentId: string) => void
}

export const useCommentStore = create<CommentStore>((set, get) => ({
  comments: getItem<Record<string, Comment[]>>('comments', {}),

  getComments: (matchId) => {
    return get().comments[matchId] ?? []
  },

  addComment: (matchId, userId, username, text) => {
    const comment: Comment = {
      id: nanoid(),
      userId,
      username,
      matchId,
      text: text.trim().slice(0, 500),
      createdAt: Date.now(),
    }

    const newComments = { ...get().comments }
    if (!newComments[matchId]) newComments[matchId] = []
    newComments[matchId] = [comment, ...newComments[matchId]]
    set({ comments: newComments })
    setItem('comments', newComments)
  },

  deleteComment: (matchId, commentId) => {
    const newComments = { ...get().comments }
    if (!newComments[matchId]) return
    newComments[matchId] = newComments[matchId].filter((c) => c.id !== commentId)
    set({ comments: newComments })
    setItem('comments', newComments)
  },
}))
