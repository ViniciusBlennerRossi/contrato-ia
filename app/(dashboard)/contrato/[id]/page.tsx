'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

type Contrato = {
  id: string
  title: string
  type: string
  content: string
  createdAt: string
}

export default function ContratoPage() {
  const params = useParams()
  const [contrato, setContrato] = useState<Contrato | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    fetch(`/api/contratos/${params.id}`)
      .then((r) => r.json())
      .then((data) => { setContrato(data.contrato); setLoading(false) })
      .catch(() => setLoading(false))
  }, [params.id])

  function copiar() {
    if (!contrato) return
    navigator.clipboard.writeText(contrato.content)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  function imprimir() {
    if (!contrato) return
    const win = window.open('', '_blank')!
    win.document.write(`
      <html><head><title>${contrato.title}</title>
      <style>body{font-family:Georgia,serif;max-width:800px;margin:40px auto;padding:0 20px;line-height:1.8;font-size:14px}pre{white-space:pre-wrap;font-family:inherit}</style></head>
      <body><pre>${contrato.content}</pre></body></html>
    `)
    win.document.close()
    win.print()
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

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-[#0e0e0e] transition-colors">
          ← Voltar
        </Link>
      </div>

      <div className="bg-white border border-[#d4c9b8] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[#d4c9b8] bg-[#f9f6f0]">
          <div>
            <h1 className="font-semibold text-[#0e0e0e] text-sm">{contrato.title}</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {new Date(contrato.createdAt).toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={copiar}
              className="flex items-center gap-1.5 text-xs bg-[#0e0e0e] text-white px-3 py-1.5 rounded-lg hover:bg-[#1a1a1a] transition-colors"
            >
              {copiado ? '✓ Copiado' : '📋 Copiar'}
            </button>
            <button
              onClick={imprimir}
              className="flex items-center gap-1.5 text-xs bg-[#c9a84c] text-black font-medium px-3 py-1.5 rounded-lg hover:bg-[#b8963e] transition-colors"
            >
              🖨️ Imprimir / PDF
            </button>
          </div>
        </div>
        <div className="p-6 md:p-8">
          <pre className="whitespace-pre-wrap font-serif text-sm text-[#0e0e0e] leading-relaxed">
            {contrato.content}
          </pre>
        </div>
      </div>
    </div>
  )
}
