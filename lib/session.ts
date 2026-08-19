import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const DURACAO_MS = 7 * 24 * 60 * 60 * 1000

let chaveCodificada: Uint8Array | null = null

/**
 * Sem SESSION_SECRET, `encode(undefined)` produzia a string "undefined" e o app
 * seguia funcionando — assinando sessões com uma chave que qualquer um adivinha.
 * Falhar alto é melhor que subir inseguro em silêncio.
 *
 * A validação é na primeira chamada, não no topo do módulo: o `next build`
 * dentro do container roda sem variáveis de ambiente e quebraria a compilação.
 */
function chave(): Uint8Array {
  if (!chaveCodificada) {
    const segredo = process.env.SESSION_SECRET
    if (!segredo) {
      throw new Error(
        'SESSION_SECRET não configurada — sem ela as sessões não podem ser assinadas com segurança'
      )
    }
    chaveCodificada = new TextEncoder().encode(segredo)
  }
  return chaveCodificada
}

export type SessionPayload = {
  userId: string
  plan: string
  expiresAt: Date
}

const OPCOES_COOKIE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
} as const

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(chave())
}

export async function decrypt(session: string | undefined = '') {
  // A chave é obtida fora do try de propósito: erro de configuração deve
  // estourar, e não virar "usuário deslogado" silencioso.
  const segredo = chave()

  try {
    const { payload } = await jwtVerify(session, segredo, {
      algorithms: ['HS256'],
    })
    return payload as SessionPayload
  } catch {
    return null
  }
}

export async function createSession(userId: string, plan: string) {
  const expiresAt = new Date(Date.now() + DURACAO_MS)
  const session = await encrypt({ userId, plan, expiresAt })
  const cookieStore = await cookies()

  cookieStore.set('session', session, { ...OPCOES_COOKIE, expires: expiresAt })
}

export async function updateSession(plan?: string) {
  const cookieStore = await cookies()
  const sessionValue = cookieStore.get('session')?.value
  const payload = await decrypt(sessionValue)

  if (!sessionValue || !payload) return null

  const expiresAt = new Date(Date.now() + DURACAO_MS)
  const newSession = await encrypt({
    userId: payload.userId,
    plan: plan ?? payload.plan,
    expiresAt,
  })

  cookieStore.set('session', newSession, { ...OPCOES_COOKIE, expires: expiresAt })
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

export async function getSession() {
  const cookieStore = await cookies()
  const sessionValue = cookieStore.get('session')?.value
  return decrypt(sessionValue)
}
