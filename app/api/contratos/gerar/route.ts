import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { checkCanGenerateContract } from '@/lib/dal'
import { generateContract } from '@/lib/gemini'
import { buildPrompt } from '@/lib/contratos/prompts'
import { getTipoById } from '@/lib/contratos/tipos'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session?.userId) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { canGenerate, reason } = await checkCanGenerateContract(
    session.userId,
    session.plan
  )

  if (!canGenerate) {
    const mensagens: Record<string, string> = {
      no_plan: 'Você precisa de um plano ativo para gerar contratos',
      limit_reached: 'Você atingiu o limite de contratos do seu plano',
    }
    return NextResponse.json(
      { error: mensagens[reason ?? ''] ?? 'Limite atingido', reason },
      { status: 402 }
    )
  }

  let body: Record<string, string>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  const campos = ['contratante', 'cpfCnpjContratante', 'contratado', 'cpfCnpjContratado', 'descricao', 'tipoContrato']
  for (const campo of campos) {
    if (!body[campo]) {
      return NextResponse.json({ error: `Campo obrigatório: ${campo}` }, { status: 400 })
    }
  }

  const tipo = getTipoById(body.tipoContrato)
  if (!tipo) {
    return NextResponse.json({ error: 'Tipo de contrato inválido' }, { status: 400 })
  }

  try {
    const prompt = buildPrompt({
      contratante: body.contratante,
      cpfCnpjContratante: body.cpfCnpjContratante,
      contratado: body.contratado,
      cpfCnpjContratado: body.cpfCnpjContratado,
      valor: body.valor ?? '0',
      duracao: body.duracao ?? 'Indeterminado',
      descricao: body.descricao,
      cidade: body.cidade ?? '',
      estado: body.estado ?? '',
      formaPagamento: body.formaPagamento ?? 'A combinar',
      tipoContrato: body.tipoContrato,
    })

    const conteudo = await generateContract(prompt)

    const titulo = `${tipo.nome} — ${body.contratante} × ${body.contratado}`

    // Re-verifica o limite antes de salvar (proteção contra race condition)
    const { canGenerate: aindaPode } = await checkCanGenerateContract(session.userId, session.plan)
    if (!aindaPode) {
      return NextResponse.json({ error: 'Limite do plano atingido', reason: 'limit_reached' }, { status: 402 })
    }

    const contrato = await db.contract.create({
      data: {
        userId: session.userId,
        type: body.tipoContrato,
        title: titulo,
        content: conteudo,
        formData: body,
      },
    })

    await db.user.update({
      where: { id: session.userId },
      data: { contractsUsed: { increment: 1 } },
    })

    return NextResponse.json({ contrato: { id: contrato.id, titulo, conteudo } })
  } catch (error) {
    console.error('Erro ao gerar contrato:', error)
    return NextResponse.json({ error: 'Falha ao gerar o contrato. Tente novamente.' }, { status: 500 })
  }
}
