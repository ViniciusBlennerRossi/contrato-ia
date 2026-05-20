import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'
import { stripe, PLANOS_STRIPE } from '@/lib/stripe'

const APP_URL = 'https://contratoia.v3app.com.br'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session?.userId) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { plano } = await request.json()

  if (!['AVULSO', 'MENSAL', 'PROFISSIONAL'].includes(plano)) {
    return NextResponse.json({ error: 'Plano inválido' }, { status: 400 })
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { email: true },
  })

  if (!user) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  }

  const dadosPlano = PLANOS_STRIPE[plano as keyof typeof PLANOS_STRIPE]

  try {
    const lineItem = dadosPlano.modo === 'subscription'
      ? {
          price_data: {
            currency: 'brl',
            product_data: { name: dadosPlano.nome },
            recurring: { interval: 'month' as const },
            unit_amount: dadosPlano.valor,
          },
          quantity: 1,
        }
      : {
          price_data: {
            currency: 'brl',
            product_data: { name: dadosPlano.nome },
            unit_amount: dadosPlano.valor,
          },
          quantity: 1,
        }

    const checkoutSession = await (stripe.checkout.sessions.create as any)({
      mode: dadosPlano.modo,
      line_items: [lineItem],
      customer_email: user.email,
      metadata: {
        userId: session.userId,
        plano,
      },
      automatic_payment_methods: { enabled: true },
      success_url: `${APP_URL}/dashboard?pagamento=sucesso`,
      cancel_url: `${APP_URL}/assinatura?pagamento=cancelado`,
    })

    return NextResponse.json({ checkoutUrl: checkoutSession.url })
  } catch (error) {
    const msg = error instanceof Error ? error.message : JSON.stringify(error)
    console.error('Erro ao criar sessão Stripe:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
