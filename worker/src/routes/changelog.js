import { json } from '../middleware/cors.js'

export async function handleChangelog(req, env) {
  if (req.method === 'GET') return getChangelog(req, env)
  return json({ message: 'Not found' }, 404)
}

async function getChangelog(req, env) {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS changelog (
    id          TEXT PRIMARY KEY,
    commit_sha  TEXT NOT NULL,
    commit_msg  TEXT NOT NULL,
    author      TEXT NOT NULL,
    screen_path TEXT NOT NULL,
    action      TEXT NOT NULL,
    pushed_at   INTEGER NOT NULL DEFAULT (unixepoch())
  )`).run()
  await env.DB.prepare(
    `CREATE INDEX IF NOT EXISTS idx_changelog_pushed_at ON changelog(pushed_at DESC)`
  ).run()

  const { results } = await env.DB.prepare(`
    SELECT * FROM changelog ORDER BY pushed_at DESC LIMIT 200
  `).all()
  return json({ changelog: results })
}
