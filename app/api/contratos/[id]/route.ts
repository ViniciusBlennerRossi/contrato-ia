import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session?.userId) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { id } = await params

  const contrato = await db.contract.findFirst({
    where: { id, userId: session.userId },
  })

  if (!contrato) {
    return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  }

  return NextResponse.json({ contrato })
}
