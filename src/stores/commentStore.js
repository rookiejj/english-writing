import { create } from 'zustand'
import * as commentService from '@/services/comment.service'

const useCommentStore = create((set, get) => ({
  allComments: [],
  pageComments: [],
  currentPageId: null,
  loading: false,
  allLoading: false,
  allFetched: false,

  setCurrentPage: (pageId) => {
    set({ currentPageId: pageId })
    get().fetchPageComments(pageId)
  },

  fetchAllComments: async ({ force = false } = {}) => {
    if (!force && get().allFetched) return
    set({ allLoading: true, allFetched: true })
    try {
      const { comments } = await commentService.getAllComments()
      set({ allComments: comments.map(c => ({ ...c, replies: c.replies ?? [] })), allLoading: false })
    } catch {
      set({ allLoading: false, allFetched: false })
    }
  },

  fetchPageComments: async (pageId) => {
    set({ loading: true })
    try {
      const { comments } = await commentService.getPageComments(pageId)
      set({ pageComments: comments, loading: false })
    } catch {
      set({ loading: false })
    }
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

  resolveComment: async (commentId, token) => {
    const toggleNested = (list) => list.map(c => {
      if (c.id === commentId) return { ...c, resolved: c.resolved ? 0 : 1 }
      if (c.replies?.some(r => r.id === commentId)) {
        return { ...c, replies: c.replies.map(r => r.id === commentId ? { ...r, resolved: r.resolved ? 0 : 1 } : r) }
      }
      return c
    })
    set(state => ({
      pageComments: toggleNested(state.pageComments),
      allComments: toggleNested(state.allComments),
    }))
    try { await commentService.resolveComment(commentId, token) } catch {}
  },

  deleteComment: async (commentId, token) => {
    await commentService.deleteComment(commentId, token)
    const { currentPageId } = get()
    await Promise.all([
      get().fetchAllComments({ force: true }),
      get().fetchPageComments(currentPageId),
    ])
  },
}))

export default useCommentStore
