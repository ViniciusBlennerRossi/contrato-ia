import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'

const OWNER_EMAIL = 'viniciusblenner@gmail.com'

async function verificarAdmin() {
  const session = await getSession()
  if (!session?.userId) return false
  const user = await db.user.findUnique({ where: { id: session.userId }, select: { email: true } })
  return user?.email === OWNER_EMAIL
}

export async function GET(request: NextRequest) {
  if (!await verificarAdmin()) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const email = request.nextUrl.searchParams.get('email')
  if (!email) return NextResponse.json({ error: 'Email obrigatório' }, { status: 400 })

  const usuario = await db.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, plan: true, contractsUsed: true, bonusContracts: true, createdAt: true },
  })

  if (!usuario) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  return NextResponse.json({ usuario })
}

export async function POST(request: NextRequest) {
  if (!await verificarAdmin()) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const { id, plan, bonusContracts, contractsUsed } = await request.json()
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })

  await db.user.update({
    where: { id },
    data: { plan, bonusContracts, contractsUsed },
  })

  return NextResponse.json({ ok: true })
}
