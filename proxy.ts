import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/lib/session'

const rotasProtegidas = ['/dashboard', '/gerar', '/assinatura']
const rotasPublicas = ['/login', '/cadastro', '/']

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isProtected = rotasProtegidas.some((r) => path.startsWith(r))
  const isPublic = rotasPublicas.includes(path)

  const sessionCookie = req.cookies.get('session')?.value
  const session = await decrypt(sessionCookie)

  if (isProtected && !session?.userId) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  if (isPublic && session?.userId && path === '/login') {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
