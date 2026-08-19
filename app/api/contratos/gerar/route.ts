import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/session'
import { podeGerarContrato, registrarContrato } from '@/lib/dal'
import { generateContract } from '@/lib/llm'
import { buildPrompt } from '@/lib/contratos/prompts'
import { getTipoById } from '@/lib/contratos/tipos'

/**
 * Os limites de tamanho não são decoração: o texto vai inteiro para o prompt,
 * e uma descrição colada de 200 mil caracteres estoura o contexto do modelo e
 * queima a cota diária da conta de IA.
 */
const textoCurto = z.string().trim().min(1).max(200)
const documento = z.string().trim().min(1).max(30)

const esquema = z.object({
  tipoContrato: z.string().trim().min(1).max(60),
  contratante: textoCurto,
  cpfCnpjContratante: documento,
  contratado: textoCurto,
  cpfCnpjContratado: documento,
  descricao: z.string().trim().min(1).max(2000),
  valor: z.string().trim().max(40).optional(),
  duracao: z.string().trim().max(80).optional(),
  cidade: z.string().trim().max(80).optional(),
  estado: z.string().trim().max(2).optional(),
  formaPagamento: z.string().trim().max(60).optional(),
})

const MENSAGENS_SEM_SALDO: Record<string, string> = {
  no_plan: 'Você precisa de um plano ativo para gerar contratos',
  limit_reached: 'Você atingiu o limite de contratos do seu plano',
  no_user: 'Não foi possível identificar sua conta',
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session?.userId) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  // Checagem barata antes de gastar a chamada de IA. O limite de verdade é
  // garantido dentro da transação de registrarContrato, mais adiante.
  const previa = await podeGerarContrato(session.userId)
  if (!previa.pode) {
    return NextResponse.json(
      { error: MENSAGENS_SEM_SALDO[previa.motivo] ?? 'Limite atingido', reason: previa.motivo },
      { status: 402 }
    )
  }

  let corpo: unknown
  try {
    corpo = await request.json()
  } catch {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  const validado = esquema.safeParse(corpo)
  if (!validado.success) {
    const problema = validado.error.issues[0]
    return NextResponse.json(
      { error: `Campo "${problema.path.join('.')}": ${problema.message}` },
      { status: 400 }
    )
  }

  const dados = validado.data
  const tipo = getTipoById(dados.tipoContrato)
  if (!tipo) {
    return NextResponse.json({ error: 'Tipo de contrato inválido' }, { status: 400 })
  }

  try {
    const prompt = buildPrompt({
      contratante: dados.contratante,
      cpfCnpjContratante: dados.cpfCnpjContratante,
      contratado: dados.contratado,
      cpfCnpjContratado: dados.cpfCnpjContratado,
      valor: dados.valor || '0',
      duracao: dados.duracao || 'Indeterminado',
      descricao: dados.descricao,
      cidade: dados.cidade ?? '',
      estado: dados.estado ?? '',
      formaPagamento: dados.formaPagamento || 'A combinar',
      tipoContrato: dados.tipoContrato,
    })

    const conteudo = await generateContract(prompt)
    const titulo = `${tipo.nome} — ${dados.contratante} × ${dados.contratado}`

    const registro = await registrarContrato(session.userId, {
      type: dados.tipoContrato,
      title: titulo,
      content: conteudo,
      formData: dados,
    })

    if (!registro.ok) {
      return NextResponse.json(
        {
          error: MENSAGENS_SEM_SALDO[registro.motivo] ?? 'Limite atingido',
          reason: registro.motivo,
        },
        { status: 402 }
      )
    }

    return NextResponse.json({ contrato: { id: registro.id, titulo, conteudo } })
  } catch (error) {
    console.error('Erro ao gerar contrato:', error)
    return NextResponse.json({ error: 'Falha ao gerar o contrato. Tente novamente.' }, { status: 500 })
  }
}
