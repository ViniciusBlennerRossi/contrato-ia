import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'
import { getStripe } from '@/lib/stripe'
import { PLANOS, type Plano } from '@/lib/planos'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://contrato.v3app.com.br'

const PLANOS_PAGOS: Plano[] = ['AVULSO', 'MENSAL', 'PROFISSIONAL']

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session?.userId) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  let plano: unknown
  try {
    ;({ plano } = await request.json())
  } catch {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  if (!PLANOS_PAGOS.includes(plano as Plano)) {
    return NextResponse.json({ error: 'Plano inválido' }, { status: 400 })
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { email: true },
  })

  if (!user) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  }

  const dadosPlano = PLANOS[plano as Plano]
  const nomeNoCheckout = `ContratoIA ${dadosPlano.rotulo}`

  try {
    const lineItem =
      dadosPlano.modoStripe === 'subscription'
        ? {
            price_data: {
              currency: 'brl',
              product_data: { name: nomeNoCheckout },
              recurring: { interval: 'month' as const },
              unit_amount: dadosPlano.precoCentavos,
            },
            quantity: 1,
          }
        : {
            price_data: {
              currency: 'brl',
              product_data: { name: nomeNoCheckout },
              unit_amount: dadosPlano.precoCentavos,
            },
            quantity: 1,
          }

    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: dadosPlano.modoStripe,
      line_items: [lineItem],
      customer_email: user.email,
      metadata: {
        userId: session.userId,
        plano: plano as string,
      },
      payment_method_types: ['card'],
      success_url: `${APP_URL}/dashboard?pagamento=sucesso`,
      cancel_url: `${APP_URL}/assinatura?pagamento=cancelado`,
    })

    return NextResponse.json({ checkoutUrl: checkoutSession.url })
  } catch (error) {
    // A mensagem crua do Stripe ficava exposta ao navegador desde um commit de
    // depuração: fica no log do servidor, o cliente recebe algo acionável.
    console.error('Erro ao criar sessão Stripe:', error)
    return NextResponse.json(
      { error: 'Não foi possível abrir o pagamento. Tente novamente em instantes.' },
      { status: 500 }
    )
  }
}
