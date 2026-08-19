import 'server-only'
import Stripe from 'stripe'

let cliente: Stripe | null = null

/**
 * Instancia sob demanda: no `next build` dentro do container não existe
 * STRIPE_SECRET_KEY, e criar o cliente no topo do módulo quebrava a coleta
 * de dados das rotas de pagamento.
 */
export function getStripe(): Stripe {
  if (!cliente) {
    const chave = process.env.STRIPE_SECRET_KEY
    if (!chave) throw new Error('STRIPE_SECRET_KEY não configurada')
    cliente = new Stripe(chave, { apiVersion: '2026-04-22.dahlia' as any })
  }
  return cliente
}

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
