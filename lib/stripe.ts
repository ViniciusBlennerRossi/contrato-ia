import 'server-only'
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia' as any,
})

export const PLANOS_STRIPE = {
  AVULSO: {
    nome: 'ContratoIA — Contrato Avulso',
    valor: 2900,
    modo: 'payment' as const,
  },
  MENSAL: {
    nome: 'ContratoIA Mensal',
    descricao: '10 contratos por mês',
    valor: 4700,
    modo: 'subscription' as const,
  },
  PROFISSIONAL: {
    nome: 'ContratoIA Profissional',
    descricao: 'Contratos ilimitados + suporte WhatsApp',
    valor: 19700,
    modo: 'subscription' as const,
  },
}
