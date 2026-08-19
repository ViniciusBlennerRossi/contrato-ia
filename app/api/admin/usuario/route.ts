import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'
import { IDS_PLANOS } from '@/lib/planos'

const OWNER_EMAIL = 'viniciusblenner@gmail.com'

const CAMPOS_VISIVEIS = {
  id: true,
  name: true,
  email: true,
  plan: true,
  contractsUsed: true,
  bonusContracts: true,
  createdAt: true,
} as const

/**
 * O portão já estava certo (só o dono passa), mas os valores iam direto para o
 * banco: um plano inexistente virava erro 500 sem explicação, e um número
 * negativo em contractsUsed quebraria a barra de progresso do cliente.
 */
const esquemaAtualizacao = z.object({
  id: z.string().min(1, 'obrigatório'),
  plan: z.enum(IDS_PLANOS).optional(),
  bonusContracts: z.number().int().min(0).max(9999).optional(),
  contractsUsed: z.number().int().min(0).max(9999).optional(),
})

async function verificarAdmin() {
  const session = await getSession()
  if (!session?.userId) return false
  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { email: true },
  })
  return user?.email === OWNER_EMAIL
}

export async function GET(request: NextRequest) {
  if (!(await verificarAdmin())) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const email = request.nextUrl.searchParams.get('email')?.trim()
  if (!email) return NextResponse.json({ error: 'Email obrigatório' }, { status: 400 })

  const usuario = await db.user.findUnique({
    where: { email },
    select: CAMPOS_VISIVEIS,
  })

  if (!usuario) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  return NextResponse.json({ usuario })
}

export async function POST(request: NextRequest) {
  if (!(await verificarAdmin())) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  let corpo: unknown
  try {
    corpo = await request.json()
  } catch {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  const validado = esquemaAtualizacao.safeParse(corpo)
  if (!validado.success) {
    const problema = validado.error.issues[0]
    return NextResponse.json(
      { error: `Campo "${problema.path.join('.')}": ${problema.message}` },
      { status: 400 }
    )
  }

  const { id, ...alteracoes } = validado.data

  const usuario = await db.user.update({
    where: { id },
    data: alteracoes,
    select: CAMPOS_VISIVEIS,
  })

  return NextResponse.json({ ok: true, usuario })
}
