import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'

const esquemaEdicao = z.object({
  content: z.string().min(1, 'o contrato não pode ficar vazio').max(100_000),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session?.userId) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { id } = await params

  const contrato = await db.contract.findFirst({
    where: { id, userId: session.userId },
  })

  if (!contrato) {
    return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  }

  return NextResponse.json({ contrato })
}

/**
 * Salva a edição feita pelo usuário.
 *
 * A tela convidava a editar o contrato, mas o texto só existia no estado do
 * React: quem ajustava as cláusulas e voltava ao histórico encontrava a versão
 * original de volta.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session?.userId) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { id } = await params

  let corpo: unknown
  try {
    corpo = await request.json()
  } catch {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  const validado = esquemaEdicao.safeParse(corpo)
  if (!validado.success) {
    return NextResponse.json({ error: validado.error.issues[0].message }, { status: 400 })
  }

  // updateMany porque o filtro por dono precisa entrar no WHERE: o update
  // simples do Prisma só aceita a chave única.
  const resultado = await db.contract.updateMany({
    where: { id, userId: session.userId },
    data: { content: validado.data.content },
  })

  if (resultado.count === 0) {
    return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}
