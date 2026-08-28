import { json, requireAuth } from '../middleware/cors.js'

export async function handleComments(req, env) {
  const url = new URL(req.url)
  const path = url.pathname
  const method = req.method

  try { await env.DB.prepare('ALTER TABLE comments ADD COLUMN resolved INTEGER NOT NULL DEFAULT 0').run() } catch {}

  if (method === 'GET' && path === '/api/comments') return getComments(req, env)
  if (method === 'POST' && path === '/api/comments') return createComment(req, env)
  if (method === 'PATCH' && path.startsWith('/api/comments/') && path.endsWith('/resolve')) return resolveComment(req, env)
  if (method === 'DELETE' && path.startsWith('/api/comments/')) return deleteComment(req, env)
  return json({ message: 'Not found' }, 404)
}

async function getComments(req, env) {
  const url = new URL(req.url)
  const pageId = url.searchParams.get('pageId')

  if (pageId) {
    // 특정 페이지의 코멘트 + 답글
    const { results: roots } = await env.DB.prepare(`
      SELECT c.*, u.nickname FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.page_id = ? AND c.parent_id IS NULL AND c.deleted_at IS NULL
      ORDER BY c.created_at ASC
    `).bind(pageId).all()

    const comments = await Promise.all(roots.map(async (c) => {
      const { results: replies } = await env.DB.prepare(`
        SELECT c.*, u.nickname FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.parent_id = ? AND c.deleted_at IS NULL
        ORDER BY c.created_at ASC
      `).bind(c.id).all()
      return { ...c, replies }
    }))
    return json({ comments })
  }

  // 전체 코멘트 (최신 100건, 답글 제외 — 패널 전체 탭용)
  const { results } = await env.DB.prepare(`
    SELECT c.*, u.nickname FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.parent_id IS NULL AND c.deleted_at IS NULL
    ORDER BY c.created_at DESC LIMIT 100
  `).all()
  return json({ comments: results })
}

async function createComment(req, env) {
  const payload = await requireAuth(req, env)
  if (!payload) return json({ message: '인증이 필요합니다' }, 401)

  const { pageId, content, parentId } = await req.json()
  if (!pageId || !content?.trim()) return json({ message: '필수 항목을 입력해주세요' }, 400)

  const id = crypto.randomUUID()
  await env.DB.prepare(
    'INSERT INTO comments (id, page_id, user_id, parent_id, content) VALUES (?, ?, ?, ?, ?)'
  ).bind(id, pageId, payload.sub, parentId || null, content.trim()).run()

  const comment = await env.DB.prepare(
    'SELECT c.*, u.nickname FROM comments c JOIN users u ON c.user_id = u.id WHERE c.id = ?'
  ).bind(id).first()
  return json({ comment })
}

async function resolveComment(req, env) {
  const payload = await requireAuth(req, env)
  if (!payload) return json({ message: '인증이 필요합니다' }, 401)
  if (payload.email !== 'rookiejj@gmail.com') return json({ message: '권한이 없습니다' }, 403)

  const id = new URL(req.url).pathname.split('/').at(-2)
  const comment = await env.DB.prepare('SELECT * FROM comments WHERE id = ?').bind(id).first()
  if (!comment) return json({ message: '코멘트를 찾을 수 없습니다' }, 404)

  const next = comment.resolved ? 0 : 1
  await env.DB.prepare('UPDATE comments SET resolved = ? WHERE id = ?').bind(next, id).run()
  return json({ ok: true, resolved: next })
}

async function deleteComment(req, env) {
  const payload = await requireAuth(req, env)
  if (!payload) return json({ message: '인증이 필요합니다' }, 401)

  const id = new URL(req.url).pathname.split('/').pop()
  const comment = await env.DB.prepare('SELECT * FROM comments WHERE id = ?').bind(id).first()
  if (!comment) return json({ message: '코멘트를 찾을 수 없습니다' }, 404)
  if (comment.user_id !== payload.sub) return json({ message: '권한이 없습니다' }, 403)

  await env.DB.prepare('UPDATE comments SET deleted_at = unixepoch() WHERE id = ?').bind(id).run()
  return json({ ok: true })
}
