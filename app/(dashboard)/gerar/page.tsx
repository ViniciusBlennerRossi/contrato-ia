'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TIPOS_CONTRATO } from '@/lib/contratos/tipos'

type Contrato = { id: string; titulo: string; conteudo: string }

const FORMAS_PAGAMENTO = ['PIX', 'Boleto', 'TED/DOC', 'Cartão de Crédito', 'Dinheiro', 'À combinar']

export default function GerarPage() {
  const [tipoSelecionado, setTipoSelecionado] = useState(TIPOS_CONTRATO[0].id)
  const [carregando, setCarregando] = useState(false)
  const [contrato, setContrato] = useState<Contrato | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setCarregando(true)
    setErro(null)
    setContrato(null)

    const form = new FormData(e.currentTarget)
    const dados = Object.fromEntries(form.entries())

    try {
      const res = await fetch('/api/contratos/gerar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...dados, tipoContrato: tipoSelecionado }),
      })

      const json = await res.json()

      if (!res.ok) {
        if (res.status === 402) {
          setErro(
            json.reason === 'no_plan'
              ? 'Você precisa de um plano para gerar contratos. Faça upgrade!'
              : 'Você atingiu o limite do seu plano. Faça upgrade para continuar!'
          )
        } else {
          setErro(json.error ?? 'Erro ao gerar contrato')
        }
        return
      }

      setContrato(json.contrato)
    } catch {
      setErro('Falha de conexão. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  function copiar() {
    if (!contrato) return
    navigator.clipboard.writeText(contrato.conteudo)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  function imprimir() {
    if (!contrato) return
    const win = window.open('', '_blank')!
    win.document.write(`
      <html><head><title>${contrato.titulo}</title>
      <style>body{font-family:Georgia,serif;max-width:800px;margin:40px auto;padding:0 20px;line-height:1.8;font-size:14px}
      h1{font-size:18px;text-align:center;margin-bottom:24px}
      pre{white-space:pre-wrap;font-family:inherit}</style></head>
      <body><pre>${contrato.conteudo}</pre></body></html>
    `)
    win.document.close()
    win.print()
  }

  const tipoAtual = TIPOS_CONTRATO.find((t) => t.id === tipoSelecionado)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#0e0e0e]">⚡ Gerar Contrato com IA</h1>
        <p className="text-gray-600 mt-1 text-sm">
          Preencha os dados abaixo e receba seu contrato em 30 segundos
        </p>
      </div>

      {!contrato ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white border border-[#d4c9b8] rounded-xl p-6">
            <h2 className="font-semibold text-[#0e0e0e] mb-4">1. Tipo de contrato</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {TIPOS_CONTRATO.map((tipo) => (
                <button
                  key={tipo.id}
                  type="button"
                  onClick={() => setTipoSelecionado(tipo.id)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    tipoSelecionado === tipo.id
                      ? 'border-[#c9a84c] bg-[#c9a84c]/10 text-[#0e0e0e]'
                      : 'border-[#d4c9b8] hover:border-[#c9a84c]/50 text-gray-600'
                  }`}
                >
                  <div className="text-lg mb-1">{tipo.emoji}</div>
                  <div className="text-xs font-medium leading-tight">{tipo.nome}</div>
                </button>
              ))}
            </div>
            {tipoAtual && (
              <p className="mt-3 text-xs text-gray-500">
                ℹ️ {tipoAtual.descricao}
              </p>
            )}
          </div>

          <div className="bg-white border border-[#d4c9b8] rounded-xl p-6">
            <h2 className="font-semibold text-[#0e0e0e] mb-4">2. Dados das partes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">
                  Contratante (quem contrata)
                </label>
                <input
                  name="contratante"
                  required
                  placeholder="Nome ou empresa"
                  className="w-full border border-[#d4c9b8] rounded-lg px-3 py-2.5 text-sm text-[#0e0e0e] focus:outline-none focus:border-[#c9a84c] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">CPF/CNPJ do Contratante</label>
                <input
                  name="cpfCnpjContratante"
                  required
                  placeholder="000.000.000-00 ou 00.000.000/0001-00"
                  className="w-full border border-[#d4c9b8] rounded-lg px-3 py-2.5 text-sm text-[#0e0e0e] focus:outline-none focus:border-[#c9a84c] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">
                  Contratado (quem presta)
                </label>
                <input
                  name="contratado"
                  required
                  placeholder="Nome ou empresa"
                  className="w-full border border-[#d4c9b8] rounded-lg px-3 py-2.5 text-sm text-[#0e0e0e] focus:outline-none focus:border-[#c9a84c] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">CPF/CNPJ do Contratado</label>
                <input
                  name="cpfCnpjContratado"
                  required
                  placeholder="000.000.000-00 ou 00.000.000/0001-00"
                  className="w-full border border-[#d4c9b8] rounded-lg px-3 py-2.5 text-sm text-[#0e0e0e] focus:outline-none focus:border-[#c9a84c] transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#d4c9b8] rounded-xl p-6">
            <h2 className="font-semibold text-[#0e0e0e] mb-4">3. Detalhes do contrato</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">Valor (R$)</label>
                <input
                  name="valor"
                  placeholder="Ex: 5.000,00"
                  className="w-full border border-[#d4c9b8] rounded-lg px-3 py-2.5 text-sm text-[#0e0e0e] focus:outline-none focus:border-[#c9a84c] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">Duração / Prazo</label>
                <input
                  name="duracao"
                  placeholder="Ex: 6 meses, 12 meses, indeterminado"
                  className="w-full border border-[#d4c9b8] rounded-lg px-3 py-2.5 text-sm text-[#0e0e0e] focus:outline-none focus:border-[#c9a84c] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">Cidade</label>
                <input
                  name="cidade"
                  placeholder="São Paulo"
                  className="w-full border border-[#d4c9b8] rounded-lg px-3 py-2.5 text-sm text-[#0e0e0e] focus:outline-none focus:border-[#c9a84c] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">Estado</label>
                <input
                  name="estado"
                  placeholder="SP"
                  maxLength={2}
                  className="w-full border border-[#d4c9b8] rounded-lg px-3 py-2.5 text-sm text-[#0e0e0e] focus:outline-none focus:border-[#c9a84c] transition-colors"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-gray-600 mb-1.5">Forma de Pagamento</label>
                <select
                  name="formaPagamento"
                  className="w-full border border-[#d4c9b8] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#c9a84c] transition-colors bg-white"
                >
                  {FORMAS_PAGAMENTO.map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1.5">
                Descrição do objeto / serviço
                <span className="text-red-400 ml-0.5">*</span>
              </label>
              <textarea
                name="descricao"
                required
                rows={4}
                placeholder="Descreva detalhadamente o que será contratado, entregue ou realizado..."
                className="w-full border border-[#d4c9b8] rounded-lg px-3 py-2.5 text-sm text-[#0e0e0e] focus:outline-none focus:border-[#c9a84c] transition-colors resize-y"
              />
            </div>
          </div>

          {erro && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start gap-3">
              <span className="text-red-400 mt-0.5">⚠️</span>
              <div>
                {erro}
                {erro.includes('upgrade') && (
                  <Link href="/assinatura" className="block mt-2 text-[#c9a84c] font-semibold hover:underline">
                    Ver planos →
                  </Link>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-[#c9a84c] hover:bg-[#b8963e] disabled:opacity-60 text-black font-semibold py-3 rounded-xl text-base transition-colors flex items-center justify-center gap-2"
          >
            {carregando ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Gerando com IA...
              </>
            ) : (
              <>⚡ Gerar Contrato com IA</>
            )}
          </button>
        </form>
      ) : (
        <div>
          <div className="bg-white border border-[#d4c9b8] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#d4c9b8] bg-[#f9f6f0]">
              <div>
                <h2 className="font-semibold text-[#0e0e0e] text-sm">{contrato.titulo}</h2>
                <p className="text-xs text-gray-500 mt-0.5">Contrato gerado com IA • Clique no texto para editar</p>
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
            <div className="p-2">
              <textarea
                value={contrato.conteudo}
                onChange={(e) => setContrato({ ...contrato, conteudo: e.target.value })}
                className="w-full min-h-[600px] p-4 font-serif text-sm text-[#0e0e0e] leading-relaxed border-0 outline-none resize-y bg-white"
                spellCheck={false}
              />
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={() => setContrato(null)}
              className="flex-1 border border-[#d4c9b8] text-gray-600 hover:border-[#c9a84c] py-2.5 rounded-xl text-sm transition-colors"
            >
              ← Gerar outro contrato
            </button>
            <Link
              href="/dashboard"
              className="flex-1 text-center bg-[#0e0e0e] text-white py-2.5 rounded-xl text-sm hover:bg-[#1a1a1a] transition-colors"
            >
              Ver histórico
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
