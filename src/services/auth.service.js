import { request, authRequest } from './api'

export const login = (email, password) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })

export const signup = (email, password, nickname) =>
  request('/auth/signup', { method: 'POST', body: JSON.stringify({ email, password, nickname }) })

export const updateNickname = (nickname, token) =>
  authRequest('/auth/nickname', token, { method: 'PATCH', body: JSON.stringify({ nickname }) })

export const updatePassword = (currentPassword, newPassword, token) =>
  authRequest('/auth/password', token, { method: 'PATCH', body: JSON.stringify({ currentPassword, newPassword }) })
