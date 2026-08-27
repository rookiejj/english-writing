import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import useCommentStore from '@/stores/commentStore'
import useAuthStore from '@/stores/authStore'
function normalizeOrigin(origin) {
  return /^https?:\/\/localhost(:\d+)?$/.test(origin) ? 'http://localhost' : origin
}

export function useComments() {
  const location = useLocation()
  const origin = normalizeOrigin(window.location.origin)
  const pageId = origin + location.pathname
  const { user, token } = useAuthStore()
  const store = useCommentStore()

  useEffect(() => {
    store.fetchAllComments()
  }, [])

  useEffect(() => {
    store.setCurrentPage(pageId)
  }, [pageId])

  const addComment = (content, parentId = null) => {
    if (!token) return
    return store.addComment(content, parentId, token)
  }

  const deleteComment = (id) => {
    if (!token) return
    return store.deleteComment(id, token)
  }

  const allComments = store.allComments.filter(c => c.page_id?.startsWith(origin))

  return {
    allComments,
    pageComments: store.pageComments,
    loading: store.loading,
    allLoading: store.allLoading,
    currentPageId: pageId,
    user,
    addComment,
    deleteComment,
  }
}
