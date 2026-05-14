import 'server-only'
import { MercadoPagoConfig, Preference, PreApprovalPlan, PreApproval } from 'mercadopago'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

export const PLANOS_MP = {
  MENSAL: {
    nome: 'ContratoIA Mensal',
    valor: 47,
    contratos: 10,
    descricao: '10 contratos por mês com suporte por email',
  },
  PROFISSIONAL: {
    nome: 'ContratoIA Profissional',
    valor: 197,
    contratos: -1,
    descricao: 'Contratos ilimitados com suporte prioritário via WhatsApp',
  },
}

export async function criarPreferenciaPagamentoAvulso(userId: string, userEmail: string) {
  const preference = new Preference(client)

  const result = await preference.create({
    body: {
      items: [
        {
          id: 'avulso-contrato',
          title: 'ContratoIA — Contrato Avulso',
          quantity: 1,
          unit_price: 29,
          currency_id: 'BRL',
        },
      ],
      external_reference: `avulso-${userId}`,
      back_urls: {
        success: `https://contratosia.v3app.com.br/dashboard?pagamento=sucesso`,
        failure: `https://contratosia.v3app.com.br/assinatura?pagamento=falhou`,
        pending: `https://contratosia.v3app.com.br/assinatura?pagamento=pendente`,
      },
      auto_return: 'approved',
      notification_url: `https://contratosia.v3app.com.br/api/pagamento/webhook`,
    },
  })

  return result
}

export async function criarPlanoAssinatura(plano: 'MENSAL' | 'PROFISSIONAL') {
  const dadosPlano = PLANOS_MP[plano]
  const preApprovalPlan = new PreApprovalPlan(client)

  const result = await preApprovalPlan.create({
    body: {
      reason: dadosPlano.nome,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: dadosPlano.valor,
        currency_id: 'BRL',
      },
      back_url: `https://contratosia.v3app.com.br/dashboard`,
    } as Parameters<PreApprovalPlan['create']>[0]['body'],
  })

  return result
}

export async function criarAssinatura(
  planId: string,
  userEmail: string,
  userId: string,
  plano: 'MENSAL' | 'PROFISSIONAL'
) {
  const dadosPlano = PLANOS_MP[plano]
  const preApproval = new PreApproval(client)

  const result = await preApproval.create({
    body: {
      preapproval_plan_id: planId,
      reason: dadosPlano.nome,
      payer_email: userEmail,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: dadosPlano.valor,
        currency_id: 'BRL',
      },
      external_reference: `${plano.toLowerCase()}-${userId}`,
      back_url: `https://contratosia.v3app.com.br/dashboard?pagamento=sucesso`,
    } as Parameters<PreApproval['create']>[0]['body'],
  })

  return result
}
