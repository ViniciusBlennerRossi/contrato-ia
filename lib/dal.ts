import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { getSession } from './session'
import { db } from './db'

export const verifySession = cache(async () => {
  const session = await getSession()

  if (!session?.userId) {
    redirect('/login')
  }

  return { isAuth: true, userId: session.userId, plan: session.plan }
})

export const getUser = cache(async () => {
  const session = await getSession()
  if (!session?.userId) return null

  try {
    return await db.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        plan: true,
        contractsUsed: true,
        periodResetAt: true,
        createdAt: true,
      },
    })
  } catch {
    return null
  }
})

export function getPlanLimit(plan: string): number {
  switch (plan) {
    case 'AVULSO': return 1
    case 'MENSAL': return 10
    case 'PROFISSIONAL': return Infinity
    default: return 0
  }
}

export async function checkCanGenerateContract(userId: string, _sessionPlan: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { plan: true, contractsUsed: true, bonusContracts: true, periodResetAt: true },
  })

  if (!user) return { canGenerate: false, reason: 'no_user' }

  const plan = user.plan
  const limit = getPlanLimit(plan)
  if (limit === Infinity) return { canGenerate: true }

  const totalLimit = limit + (user.bonusContracts ?? 0)
  if (totalLimit === 0) return { canGenerate: false, reason: 'no_plan' }

  if (plan === 'MENSAL' && user.periodResetAt && new Date() > user.periodResetAt) {
    await db.user.update({
      where: { id: userId },
      data: {
        contractsUsed: 0,
        periodResetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })
    return { canGenerate: true }
  }

  if (user.contractsUsed >= totalLimit) {
    return { canGenerate: false, reason: 'limit_reached' }
  }

  return { canGenerate: true }
}
