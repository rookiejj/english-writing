// Web Crypto API 기반 HS256 JWT — 외부 의존성 없음 (Workers 런타임 내장)
const enc = new TextEncoder()

function b64url(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function decodeB64(str) {
  return atob(str.replace(/-/g, '+').replace(/_/g, '/'))
}

async function getKey(secret) {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'])
}

export async function sign(payload, secret) {
  const header = b64url(enc.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })))
  const body = b64url(enc.encode(JSON.stringify({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30일
  })))
  const data = `${header}.${body}`
  const key = await getKey(secret)
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data))
  return `${data}.${b64url(sig)}`
}

export async function verify(token, secret) {
  const parts = token.split('.')
  if (parts.length !== 3) throw new Error('invalid token')
  const [header, body, sig] = parts
  const key = await getKey(secret)
  const valid = await crypto.subtle.verify(
    'HMAC', key,
    Uint8Array.from(decodeB64(sig), c => c.charCodeAt(0)),
    enc.encode(`${header}.${body}`)
  )
  if (!valid) throw new Error('invalid signature')
  const payload = JSON.parse(decodeB64(body))
  if (payload.exp && payload.exp < Date.now() / 1000) throw new Error('token expired')
  return payload
}
