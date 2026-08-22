// PBKDF2 기반 비밀번호 해싱 — Web Crypto API (Workers 런타임 내장)
const enc = new TextEncoder()

async function deriveKey(password, salt) {
  const material = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  return crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, hash: 'SHA-256', iterations: 100_000 },
    material, 256
  )
}

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const hash = new Uint8Array(await deriveKey(password, salt))
  const out = new Uint8Array(salt.length + hash.length)
  out.set(salt)
  out.set(hash, salt.length)
  return btoa(String.fromCharCode(...out))
}

export async function verifyPassword(password, stored) {
  const combined = Uint8Array.from(atob(stored), c => c.charCodeAt(0))
  const salt = combined.slice(0, 16)
  const expected = combined.slice(16)
  const actual = new Uint8Array(await deriveKey(password, salt))
  return actual.length === expected.length && actual.every((b, i) => b === expected[i])
}
