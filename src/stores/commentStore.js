import { create } from 'zustand'
import * as commentService from '@/services/comment.service'

const useCommentStore = create((set, get) => ({
  allComments: [],
  pageComments: [],
  currentPageId: null,
  loading: false,
  allLoading: false,

  setCurrentPage: (pageId) => {
    set({ currentPageId: pageId })
    get().fetchPageComments(pageId)
  },

  fetchAllComments: async () => {
    set({ allLoading: true })
    const { comments } = await commentService.getAllComments()
    set({ allComments: comments.map(c => ({ ...c, replies: c.replies ?? [] })), allLoading: false })
  },

  fetchPageComments: async (pageId) => {
    set({ loading: true })
    const { comments } = await commentService.getPageComments(pageId)
    set({ pageComments: comments, loading: false })
  },

  addComment: async (content, parentId, token) => {
    const { currentPageId } = get()
    const { comment } = await commentService.createComment(currentPageId, content, parentId, token)

    if (!parentId) {
      const newComment = { ...comment, replies: [] }
      set(state => ({
        pageComments: [...state.pageComments, newComment],
        allComments: [...state.allComments, newComment],
      }))
    } else {
      const appendReply = (list) =>
        list.map(c => c.id === parentId ? { ...c, replies: [...(c.replies || []), comment] } : c)
      set(state => ({
        pageComments: appendReply(state.pageComments),
        allComments: appendReply(state.allComments),
      }))
    }
  },

  deleteComment: async (commentId, token) => {
    await commentService.deleteComment(commentId, token)
    const { currentPageId } = get()
    await Promise.all([
      get().fetchAllComments(),
      get().fetchPageComments(currentPageId),
    ])
  },
}))

export default useCommentStore
