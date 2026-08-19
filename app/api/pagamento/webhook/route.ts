import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Sem assinatura' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook inválido:', err)
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const plano = session.metadata?.plano

        if (!userId || !plano) break

        if (plano === 'AVULSO') {
          await db.user.update({
            where: { id: userId },
            data: { plan: 'AVULSO', contractsUsed: 0 },
          })
        } else if (plano === 'MENSAL' || plano === 'PROFISSIONAL') {
          const periodoFim = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          await db.user.update({
            where: { id: userId },
            data: { plan: plano, contractsUsed: 0, periodResetAt: periodoFim },
          })
          if (session.subscription) {
            await db.subscription.upsert({
              where: { mpPreapprovalId: session.subscription as string },
              create: {
                userId,
                plan: plano,
                mpPreapprovalId: session.subscription as string,
                status: 'active',
                currentPeriodEnd: periodoFim,
              },
              update: { status: 'active', currentPeriodEnd: periodoFim },
            })
          }
        }
        break
      }

      case 'invoice.paid': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invoice = event.data.object as any
        const subscriptionId: string | undefined = typeof invoice.subscription === 'string'
          ? invoice.subscription
          : invoice.subscription?.id ?? invoice.lines?.data?.[0]?.subscription
        if (!subscriptionId) break

        const sub = await db.subscription.findUnique({ where: { mpPreapprovalId: subscriptionId } })
        if (sub) {
          const periodoFim = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          await db.user.update({
            where: { id: sub.userId },
            data: { contractsUsed: 0, periodResetAt: periodoFim },
          })
          await db.subscription.update({
            where: { mpPreapprovalId: subscriptionId },
            data: { status: 'active', currentPeriodEnd: periodoFim },
          })
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const sub = await db.subscription.findUnique({ where: { mpPreapprovalId: subscription.id } })
        if (sub) {
          await db.user.update({ where: { id: sub.userId }, data: { plan: 'FREE' } })
          await db.subscription.update({
            where: { mpPreapprovalId: subscription.id },
            data: { status: 'cancelled' },
          })
        }
        break
      }

      case 'invoice.payment_failed': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invoice = event.data.object as any
        const subscriptionId: string | undefined = typeof invoice.subscription === 'string'
          ? invoice.subscription
          : invoice.subscription?.id
        if (!subscriptionId) break

        await db.subscription.updateMany({
          where: { mpPreapprovalId: subscriptionId },
          data: { status: 'paused' },
        })
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Erro no webhook:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
