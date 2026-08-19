import { NextRequest, NextResponse } from 'next/server'
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'

/**
 * Download do contrato em .docx.
 *
 * A landing anuncia "PDF + Word" desde sempre e a biblioteca já estava
 * instalada, mas nada no código a usava: o cliente pagava vendo a promessa e
 * recebia só o botão de imprimir.
 */

/** Linha em caixa alta e curta é título de cláusula — merece destaque. */
function ehTitulo(linha: string): boolean {
  const limpa = linha.trim()
  if (limpa.length === 0 || limpa.length > 90) return false
  const letras = limpa.replace(/[^A-Za-zÀ-ÿ]/g, '')
  if (letras.length < 3) return false
  return letras === letras.toUpperCase()
}

function nomeDoArquivo(titulo: string): string {
  const base = titulo
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
  return `${base || 'contrato'}.docx`
}

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
    select: { title: true, content: true },
  })

  if (!contrato) {
    return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  }

  const paragrafos = contrato.content.split('\n').map((linha) => {
    const texto = linha.trimEnd()

    if (texto.trim() === '') {
      return new Paragraph({ children: [] })
    }

    const titulo = ehTitulo(texto)

    return new Paragraph({
      alignment: titulo ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
      spacing: { after: titulo ? 240 : 120, line: 320 },
      children: [new TextRun({ text: texto, bold: titulo, size: 24, font: 'Georgia' })],
    })
  })

  const documento = new Document({
    sections: [{ properties: {}, children: paragrafos }],
  })

  const arquivo = await Packer.toBuffer(documento)

  return new NextResponse(new Uint8Array(arquivo), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${nomeDoArquivo(contrato.title)}"`,
      'Cache-Control': 'no-store',
    },
  })
}
