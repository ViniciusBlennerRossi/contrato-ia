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

export async function checkCanGenerateContract(userId: string, plan: string) {
  const limit = getPlanLimit(plan)
  if (limit === Infinity) return { canGenerate: true }
  if (limit === 0) return { canGenerate: false, reason: 'no_plan' }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { contractsUsed: true, periodResetAt: true },
  })

  if (!user) return { canGenerate: false, reason: 'no_user' }

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

  if (user.contractsUsed >= limit) {
    return { canGenerate: false, reason: 'limit_reached' }
  }

  return { canGenerate: true }
}
