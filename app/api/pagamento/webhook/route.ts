import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: true })
  }

  const { type, data } = body as { type: string; data: { id: string } }

  if (type === 'payment' && data?.id) {
    await processarPagamento(String(data.id))
  }

  if (type === 'subscription_preapproval' && data?.id) {
    await processarAssinatura(String(data.id))
  }

  return NextResponse.json({ ok: true })
}

async function processarPagamento(paymentId: string) {
  try {
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
    })
    const payment = await res.json()

    if (payment.status !== 'approved') return

    const externalRef: string = payment.external_reference ?? ''

    if (externalRef.startsWith('avulso-')) {
      const userId = externalRef.replace('avulso-', '')
      await db.user.update({
        where: { id: userId },
        data: { plan: 'AVULSO', contractsUsed: 0 },
      })
    }
  } catch (error) {
    console.error('Erro ao processar pagamento MP:', error)
  }
}

async function processarAssinatura(preapprovalId: string) {
  try {
    const res = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
      headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
    })
    const subscription = await res.json()

    const externalRef: string = subscription.external_reference ?? ''
    let plano: 'MENSAL' | 'PROFISSIONAL' | null = null

    if (externalRef.startsWith('mensal-')) plano = 'MENSAL'
    if (externalRef.startsWith('profissional-')) plano = 'PROFISSIONAL'

    if (!plano) return

    const userId = externalRef.replace(/^(mensal|profissional)-/, '')

    if (subscription.status === 'authorized') {
      const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      await db.user.update({
        where: { id: userId },
        data: { plan: plano, contractsUsed: 0, periodResetAt: periodEnd },
      })
      await db.subscription.upsert({
        where: { mpPreapprovalId: preapprovalId },
        update: { status: 'active', currentPeriodEnd: periodEnd },
        create: {
          userId,
          plan: plano,
          mpPreapprovalId: preapprovalId,
          status: 'active',
          currentPeriodEnd: periodEnd,
        },
      })
    }

    if (subscription.status === 'cancelled') {
      await db.user.update({ where: { id: userId }, data: { plan: 'FREE' } })
      await db.subscription.updateMany({
        where: { mpPreapprovalId: preapprovalId },
        data: { status: 'cancelled' },
      })
    }
  } catch (error) {
    console.error('Erro ao processar assinatura MP:', error)
  }
}
