import { create } from 'zustand'
import * as commentService from '@/services/comment.service'

const useCommentStore = create((set, get) => ({
  allComments: [],
  pageComments: [],
  currentPageId: null,
  loading: false,

  setCurrentPage: (pageId) => {
    set({ currentPageId: pageId })
    get().fetchPageComments(pageId)
  },

  fetchAllComments: async () => {
    const { comments } = await commentService.getAllComments()
    set({ allComments: comments })
  },

  fetchPageComments: async (pageId) => {
    set({ loading: true })
    const { comments } = await commentService.getPageComments(pageId)
    set({ pageComments: comments, loading: false })
  },

  addComment: async (content, parentId, token) => {
    const { currentPageId } = get()
    await commentService.createComment(currentPageId, content, parentId, token)
    await Promise.all([
      get().fetchAllComments(),
      get().fetchPageComments(currentPageId),
    ])
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
