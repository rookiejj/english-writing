import { request, authRequest } from './api'

export const getAllComments = () => request('/comments')

export const getPageComments = (pageId) =>
  request(`/comments?pageId=${encodeURIComponent(pageId)}`)

export const createComment = (pageId, content, parentId, token) =>
  authRequest('/comments', token, {
    method: 'POST',
    body: JSON.stringify({ pageId, content, parentId: parentId || null }),
  })

export const deleteComment = (id, token) =>
  authRequest(`/comments/${id}`, token, { method: 'DELETE' })
