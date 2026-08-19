/**
 * Fonte única dos planos.
 *
 * Antes desta tabela, limite e rótulo de cada plano viviam copiados em quatro
 * arquivos (dal, dashboard, layout do painel e tela de assinatura), cada um com
 * um formato. Mudar um preço exigia lembrar dos quatro.
 *
 * Sem 'server-only': a tela de assinatura é client component e consome daqui.
 */

/** Tupla const: serve de enum para o zod e casa com o enum Plan do Prisma. */
export const IDS_PLANOS = ['FREE', 'AVULSO', 'MENSAL', 'PROFISSIONAL'] as const

export type Plano = (typeof IDS_PLANOS)[number]

export type DadosPlano = {
  rotulo: string
  /** Contratos por ciclo. Infinity no ilimitado. */
  limite: number
  /** Em centavos, como o Stripe espera. */
  precoCentavos: number
  periodo: string
  descricao: string
  recursos: string[]
  modoStripe: 'payment' | 'subscription'
  destaque: boolean
}

export const PLANOS: Record<Plano, DadosPlano> = {
  FREE: {
    rotulo: 'Gratuito',
    limite: 0,
    precoCentavos: 0,
    periodo: '',
    descricao: 'Sem contratos inclusos',
    recursos: [],
    modoStripe: 'payment',
    destaque: false,
  },
  AVULSO: {
    rotulo: 'Avulso',
    limite: 1,
    precoCentavos: 2900,
    periodo: 'por contrato',
    descricao: '1 contrato, sem mensalidade',
    recursos: [
      '1 contrato gerado por IA',
      'Download em Word e impressão em PDF',
      'Histórico de 30 dias',
      'Suporte por e-mail',
    ],
    modoStripe: 'payment',
    destaque: false,
  },
  MENSAL: {
    rotulo: 'Mensal',
    limite: 10,
    precoCentavos: 4700,
    periodo: 'por mês',
    descricao: '10 contratos por mês',
    recursos: [
      '10 contratos por mês',
      'Download em Word e impressão em PDF',
      'Histórico completo',
      'Suporte por e-mail',
    ],
    modoStripe: 'subscription',
    destaque: true,
  },
  PROFISSIONAL: {
    rotulo: 'Profissional',
    limite: Infinity,
    precoCentavos: 19700,
    periodo: 'por mês',
    descricao: 'Para uso intenso e empresas',
    recursos: [
      'Contratos ilimitados',
      'Download em Word e impressão em PDF',
      'Histórico completo',
      'Suporte prioritário por WhatsApp',
    ],
    modoStripe: 'subscription',
    destaque: false,
  },
}

/** Planos que aparecem na tela de assinatura, na ordem de exibição. */
export const PLANOS_A_VENDA = (['AVULSO', 'MENSAL', 'PROFISSIONAL'] as const).map((id) => ({
  id,
  ...PLANOS[id],
}))

export function ehPlano(valor: unknown): valor is Plano {
  return typeof valor === 'string' && valor in PLANOS
}

function dados(plan: string): DadosPlano {
  return ehPlano(plan) ? PLANOS[plan] : PLANOS.FREE
}

export function limiteDoPlano(plan: string): number {
  return dados(plan).limite
}

export function rotuloDoPlano(plan: string): string {
  return dados(plan).rotulo
}

export function precoEmReais(plan: string): number {
  return dados(plan).precoCentavos / 100
}

/**
 * Quanto o usuário pode gerar agora, contando os contratos bônus.
 * Usado tanto pelo servidor quanto pelas telas — antes cada um fazia sua conta,
 * e o painel ignorava o bônus concedido pelo admin.
 *
 * O bônus é crédito consumível: sai de `bonusContracts` conforme é usado. Por
 * isso o que resta não é `limite - usados`, já que `usados` também conta as
 * gerações pagas com bônus — a conta é o que sobra do plano mais o bônus atual.
 */
export function saldoDeContratos(plan: string, usados: number, bonus: number) {
  const limite = limiteDoPlano(plan)
  const ilimitado = limite === Infinity
  const bonusAtual = Math.max(0, bonus)

  if (ilimitado) {
    return {
      limite,
      bonus: bonusAtual,
      usados,
      ilimitado: true as const,
      restantes: Infinity,
      capacidade: Infinity,
      capacidadeFormatada: '∞',
      percentualUso: 0,
    }
  }

  const restantesDoPlano = Math.max(0, limite - usados)
  const restantes = restantesDoPlano + bonusAtual
  // Denominador honesto para a barra: o que já foi usado mais o que ainda dá.
  const capacidade = usados + restantes

  return {
    limite,
    bonus: bonusAtual,
    usados,
    ilimitado: false as const,
    restantes,
    capacidade,
    capacidadeFormatada: String(capacidade),
    percentualUso: capacidade === 0 ? 100 : Math.min((usados / capacidade) * 100, 100),
  }
}
