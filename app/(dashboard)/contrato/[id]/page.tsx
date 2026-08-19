'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { imprimirContrato } from '@/lib/imprimirContrato'

type Contrato = {
  id: string
  title: string
  type: string
  content: string
  createdAt: string
}

type EstadoSalvamento = 'limpo' | 'salvando' | 'salvo' | 'erro'

export default function ContratoPage() {
  const params = useParams()
  const [contrato, setContrato] = useState<Contrato | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiado, setCopiado] = useState(false)
  const [salvamento, setSalvamento] = useState<EstadoSalvamento>('limpo')
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/contratos/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setContrato(data.contrato)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.id])

  async function salvarEdicao(atual: Contrato): Promise<boolean> {
    setSalvamento('salvando')
    try {
      const res = await fetch(`/api/contratos/${atual.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: atual.content }),
      })
      if (!res.ok) throw new Error()
      setSalvamento('salvo')
      return true
    } catch {
      setSalvamento('erro')
      return false
    }
  }

  function copiar() {
    if (!contrato) return
    navigator.clipboard.writeText(contrato.content)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  function imprimir() {
    if (!contrato) return
    const abriu = imprimirContrato(contrato.title, contrato.content)
    if (!abriu) {
      setErro('Seu navegador bloqueou a janela de impressão. Libere o pop-up e tente de novo.')
    }
  }

  async function baixarWord() {
    if (!contrato) return
    // Salva antes de baixar, senão o arquivo sairia sem as edições da tela.
    if (salvamento !== 'salvo' && !(await salvarEdicao(contrato))) {
      setErro('Não foi possível salvar suas edições antes de gerar o Word. Tente novamente.')
      return
    }
    window.location.href = `/api/contratos/${contrato.id}/docx`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-6 h-6 border-2 border-[#c9a84c] border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!contrato) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Contrato não encontrado</p>
        <Link href="/dashboard" className="text-[#c9a84c] hover:underline text-sm mt-2 block">
          ← Voltar ao dashboard
        </Link>
      </div>
    )
  }

  const avisoSalvamento = {
    limpo: 'Clique no texto para editar',
    salvando: 'Salvando…',
    salvo: 'Edições salvas ✓',
    erro: 'Não foi possível salvar. Tente editar de novo.',
  }[salvamento]

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-[#0e0e0e] transition-colors">
          ← Voltar
        </Link>
      </div>

      {erro && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {erro}
        </div>
      )}

      <div className="bg-white border border-[#d4c9b8] rounded-xl overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-[#d4c9b8] bg-[#f9f6f0]">
          <div className="min-w-0">
            <h1 className="font-semibold text-[#0e0e0e] text-sm truncate">{contrato.title}</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {new Date(contrato.createdAt).toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
              {' · '}
              <span className={salvamento === 'erro' ? 'text-red-500' : ''}>{avisoSalvamento}</span>
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={copiar}
              className="flex items-center gap-1.5 text-xs bg-[#0e0e0e] text-white px-3 py-1.5 rounded-lg hover:bg-[#1a1a1a] transition-colors"
            >
              {copiado ? '✓ Copiado' : '📋 Copiar'}
            </button>
            <button
              onClick={baixarWord}
              className="flex items-center gap-1.5 text-xs border border-[#0e0e0e] text-[#0e0e0e] px-3 py-1.5 rounded-lg hover:bg-[#0e0e0e] hover:text-white transition-colors"
            >
              📄 Word
            </button>
            <button
              onClick={imprimir}
              className="flex items-center gap-1.5 text-xs bg-[#c9a84c] text-black font-medium px-3 py-1.5 rounded-lg hover:bg-[#b8963e] transition-colors"
            >
              🖨️ Imprimir / PDF
            </button>
          </div>
        </div>
        <div className="p-2 md:p-4">
          <textarea
            value={contrato.content}
            onChange={(e) => {
              setContrato({ ...contrato, content: e.target.value })
              setSalvamento('limpo')
            }}
            onBlur={() => salvarEdicao(contrato)}
            className="w-full min-h-[600px] p-4 font-serif text-sm text-[#0e0e0e] leading-relaxed border-0 outline-none resize-y bg-white"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  )
}
