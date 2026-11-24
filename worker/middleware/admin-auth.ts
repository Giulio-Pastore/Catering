import type { Context, Next } from 'hono'
import type { Env } from '../env'

function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.byteLength !== b.byteLength) return false
  let out = 0
  for (let i = 0; i < a.byteLength; i++) {
    out |= (a[i]! ^ b[i]!)!
  }
  return out === 0
}

async function tokenMatches(provided: string, expected: string): Promise<boolean> {
  const enc = new TextEncoder()
  return bytesEqual(enc.encode(provided), enc.encode(expected))
}

export async function adminAuth(c: Context<{ Bindings: Env }>, next: Next) {
  const header = c.req.header('Authorization')
  if (!header?.startsWith('Bearer ')) {
    return c.json({ error: 'Non autorizzato' }, { status: 401 })
  }
  const token = header.slice('Bearer '.length)
  const expected = c.env.ADMIN_TOKEN
  if (!expected || !(await tokenMatches(token, expected))) {
    return c.json({ error: 'Token non valido' }, { status: 401 })
  }
  await next()
}