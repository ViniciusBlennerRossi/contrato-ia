import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'
import { criarPreferenciaPagamentoAvulso, criarPlanoAssinatura } from '@/lib/mercadopago'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session?.userId) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { plano } = await request.json()

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { email: true },
  })

  if (!user) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  }

  try {
    if (plano === 'AVULSO') {
      const preferencia = await criarPreferenciaPagamentoAvulso(session.userId, user.email)
      return NextResponse.json({ checkoutUrl: preferencia.sandbox_init_point })
    }

    if (plano === 'MENSAL' || plano === 'PROFISSIONAL') {
      const planoCriado = await criarPlanoAssinatura(plano)
      return NextResponse.json({ planId: planoCriado.id, checkoutUrl: planoCriado.init_point })
    }

    return NextResponse.json({ error: 'Plano inválido' }, { status: 400 })
  } catch (error) {
    console.error('Erro ao criar pagamento:', error)
    return NextResponse.json({ error: 'Falha ao processar pagamento' }, { status: 500 })
  }
}
