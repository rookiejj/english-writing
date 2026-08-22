import { CORS_HEADERS } from './middleware/cors.js'
import { handleAuth } from './routes/auth.js'
import { handleComments } from './routes/comments.js'

export default {
  async fetch(req, env) {
    const url = new URL(req.url)

    // CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS })
    }

    try {
      if (url.pathname.startsWith('/api/auth')) return handleAuth(req, env)
      if (url.pathname.startsWith('/api/comments')) return handleComments(req, env)
      return new Response('Not found', { status: 404 })
    } catch (err) {
      return new Response(JSON.stringify({ message: 'Internal error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      })
    }
  },
}
