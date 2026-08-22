import { json, requireAuth } from '../middleware/cors.js'
import { hashPassword, verifyPassword } from '../utils/password.js'
import { sign } from '../utils/jwt.js'

export async function handleAuth(req, env) {
  const url = new URL(req.url)
  const path = url.pathname
  const method = req.method

  if (method === 'POST' && path === '/api/auth/signup') return signup(req, env)
  if (method === 'POST' && path === '/api/auth/login') return login(req, env)
  if (method === 'PATCH' && path === '/api/auth/nickname') return updateNickname(req, env)
  if (method === 'PATCH' && path === '/api/auth/password') return updatePassword(req, env)
  return json({ message: 'Not found' }, 404)
}

async function signup(req, env) {
  const { email, password, nickname } = await req.json()
  if (!email || !password || !nickname?.trim()) return json({ message: '필수 항목을 입력해주세요' }, 400)
  if (!/^\d{4}$/.test(password)) return json({ message: '비밀번호는 숫자 4자리여야 합니다' }, 400)

  const exists = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()
  if (exists) return json({ message: '이미 사용 중인 이메일입니다' }, 409)

  const id = crypto.randomUUID()
  const password_hash = await hashPassword(password)
  await env.DB.prepare('INSERT INTO users (id, email, password_hash, nickname) VALUES (?, ?, ?, ?)')
    .bind(id, email, password_hash, nickname.trim()).run()

  const token = await sign({ sub: id, email, nickname: nickname.trim() }, env.JWT_SECRET)
  return json({ user: { id, email, nickname: nickname.trim() }, token })
}

async function login(req, env) {
  const { email, password } = await req.json()
  const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first()
  if (!user) return json({ message: '이메일 또는 비밀번호가 올바르지 않습니다' }, 401)

  const valid = await verifyPassword(password, user.password_hash)
  if (!valid) return json({ message: '이메일 또는 비밀번호가 올바르지 않습니다' }, 401)

  const token = await sign({ sub: user.id, email: user.email, nickname: user.nickname }, env.JWT_SECRET)
  return json({ user: { id: user.id, email: user.email, nickname: user.nickname }, token })
}

async function updateNickname(req, env) {
  const payload = await requireAuth(req, env)
  if (!payload) return json({ message: '인증이 필요합니다' }, 401)

  const { nickname } = await req.json()
  if (!nickname?.trim()) return json({ message: '닉네임을 입력해주세요' }, 400)

  await env.DB.prepare('UPDATE users SET nickname = ? WHERE id = ?').bind(nickname.trim(), payload.sub).run()
  return json({ nickname: nickname.trim() })
}

async function updatePassword(req, env) {
  const payload = await requireAuth(req, env)
  if (!payload) return json({ message: '인증이 필요합니다' }, 401)

  const { currentPassword, newPassword } = await req.json()
  if (!/^\d{4}$/.test(newPassword)) return json({ message: '새 비밀번호는 숫자 4자리여야 합니다' }, 400)

  const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(payload.sub).first()
  const valid = await verifyPassword(currentPassword, user.password_hash)
  if (!valid) return json({ message: '현재 비밀번호가 올바르지 않습니다' }, 401)

  await env.DB.prepare('UPDATE users SET password_hash = ? WHERE id = ?')
    .bind(await hashPassword(newPassword), payload.sub).run()
  return json({ ok: true })
}
