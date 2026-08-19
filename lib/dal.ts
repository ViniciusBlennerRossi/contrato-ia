import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { getSession } from './session'
import { db } from './db'
import { limiteDoPlano, saldoDeContratos } from './planos'

const CICLO_MS = 30 * 24 * 60 * 60 * 1000

const CAMPOS_USUARIO = {
  id: true,
  name: true,
  email: true,
  image: true,
  plan: true,
  contractsUsed: true,
  bonusContracts: true,
  periodResetAt: true,
  createdAt: true,
} as const

export const verifySession = cache(async () => {
  const session = await getSession()

  if (!session?.userId) {
    redirect('/login')
  }

  return { isAuth: true, userId: session.userId, plan: session.plan }
})

type UsuarioCarregado = {
  id: string
  plan: string
  contractsUsed: number
  bonusContracts: number
  periodResetAt: Date | null
}

/**
 * Zera o contador quando o ciclo do plano mensal venceu.
 *
 * Roda também na leitura do painel, não só na geração: antes o reset acontecia
 * apenas quando o usuário tentava gerar, então quem virava o mês continuava
 * vendo "10 de 10 contratos" e achava que tinha pagado por nada.
 */
async function renovarCicloSeVencido<T extends UsuarioCarregado>(usuario: T): Promise<T> {
  const venceu =
    usuario.plan === 'MENSAL' &&
    usuario.periodResetAt !== null &&
    new Date() > usuario.periodResetAt

  if (!venceu) return usuario

  const renovado = await db.user.update({
    where: { id: usuario.id },
    data: { contractsUsed: 0, periodResetAt: new Date(Date.now() + CICLO_MS) },
    select: CAMPOS_USUARIO,
  })

  return { ...usuario, ...renovado }
}

export const getUser = cache(async () => {
  const session = await getSession()
  if (!session?.userId) return null

  try {
    const usuario = await db.user.findUnique({
      where: { id: session.userId },
      select: CAMPOS_USUARIO,
    })

    return usuario ? await renovarCicloSeVencido(usuario) : null
  } catch {
    return null
  }
})

/** Saldo do usuário logado, já com o ciclo renovado e o bônus somado. */
export async function getSaldo() {
  const usuario = await getUser()
  if (!usuario) return null
  return saldoDeContratos(usuario.plan, usuario.contractsUsed, usuario.bonusContracts)
}

/**
 * Checagem barata, antes de gastar a chamada de IA. Não reserva nada — quem
 * garante o limite é registrarContrato, na transação.
 */
export async function podeGerarContrato(userId: string) {
  const usuario = await db.user.findUnique({
    where: { id: userId },
    select: CAMPOS_USUARIO,
  })

  if (!usuario) return { pode: false, motivo: 'no_user' as const }

  const atual = await renovarCicloSeVencido(usuario)
  const saldo = saldoDeContratos(atual.plan, atual.contractsUsed, atual.bonusContracts)

  if (saldo.ilimitado) return { pode: true as const }
  if (saldo.capacidade === 0) return { pode: false, motivo: 'no_plan' as const }
  if (saldo.restantes <= 0) return { pode: false, motivo: 'limit_reached' as const }

  return { pode: true as const }
}

type DadosContrato = {
  type: string
  title: string
  content: string
  formData: Record<string, string>
}

type MotivoSemSaldo = 'no_user' | 'no_plan' | 'limit_reached'

class SemSaldo extends Error {
  constructor(public motivo: MotivoSemSaldo) {
    super(motivo)
  }
}

/**
 * Debita o contrato e grava, na mesma transação.
 *
 * O débito é um UPDATE condicional em vez de "ler, comparar, escrever": duas
 * abas gerando ao mesmo tempo passavam pelas duas checagens antigas antes de
 * qualquer incremento. Aqui a condição é avaliada dentro do próprio UPDATE, e o
 * segundo pedido não encontra linha para atualizar.
 *
 * O bônus é debitado só depois que o limite do plano se esgota, e sai de
 * bonusContracts de verdade — antes ele nunca era decrementado, o que na
 * prática transformava a cortesia em aumento permanente de limite.
 */
export async function registrarContrato(
  userId: string,
  dados: DadosContrato
): Promise<{ ok: true; id: string } | { ok: false; motivo: MotivoSemSaldo }> {
  try {
    const contrato = await db.$transaction(async (tx) => {
      const usuario = await tx.user.findUnique({
        where: { id: userId },
        select: { plan: true, contractsUsed: true, bonusContracts: true },
      })

      if (!usuario) throw new SemSaldo('no_user')

      const limite = limiteDoPlano(usuario.plan)

      if (limite !== Infinity) {
        // 1) ainda dentro da franquia do plano
        const doPlano = await tx.user.updateMany({
          where: { id: userId, contractsUsed: { lt: limite } },
          data: { contractsUsed: { increment: 1 } },
        })

        if (doPlano.count === 0) {
          // 2) franquia esgotada: consome um contrato bônus
          const doBonus = await tx.user.updateMany({
            where: { id: userId, bonusContracts: { gt: 0 } },
            data: { bonusContracts: { decrement: 1 }, contractsUsed: { increment: 1 } },
          })

          if (doBonus.count === 0) {
            throw new SemSaldo(limite === 0 ? 'no_plan' : 'limit_reached')
          }
        }
      } else {
        await tx.user.update({
          where: { id: userId },
          data: { contractsUsed: { increment: 1 } },
        })
      }

      return await tx.contract.create({
        data: { userId, ...dados },
        select: { id: true },
      })
    })

    return { ok: true, id: contrato.id }
  } catch (erro) {
    if (erro instanceof SemSaldo) return { ok: false, motivo: erro.motivo }
    throw erro
  }
}
