'use client'

import { useState } from 'react'

const PLANOS = [
  {
    id: 'AVULSO',
    nome: 'Avulso',
    preco: 29,
    periodo: 'por contrato',
    descricao: '1 contrato, sem mensalidade',
    recursos: ['1 contrato gerado por IA', 'Export PDF + Word', 'Histórico 30 dias', 'Suporte por email'],
    destaque: false,
  },
  {
    id: 'MENSAL',
    nome: 'Mensal',
    preco: 47,
    periodo: 'por mês',
    descricao: '10 contratos por mês',
    recursos: ['10 contratos/mês', 'Export PDF + Word', 'Histórico completo', 'Suporte por email'],
    destaque: true,
  },
  {
    id: 'PROFISSIONAL',
    nome: 'Profissional',
    preco: 197,
    periodo: 'por mês',
    descricao: 'Para uso intenso e empresas',
    recursos: ['Contratos ilimitados', 'Export PDF + Word', 'Histórico completo', 'Suporte WhatsApp prioritário', 'Logotipo personalizado'],
    destaque: false,
  },
]

export default function AssinaturaPage() {
  const [loading, setLoading] = useState<string | null>(null)

  async function handleComprar(planoId: string) {
    setLoading(planoId)
    try {
      const res = await fetch('/api/pagamento/preferencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plano: planoId }),
      })
      const json = await res.json()
      if (json.checkoutUrl) {
        window.location.href = json.checkoutUrl
      } else {
        alert(`Erro: ${json.error ?? 'URL de checkout não retornada'}`)
      }
    } catch (err) {
      alert(`Erro ao processar pagamento: ${err}`)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-2xl font-semibold text-[#0e0e0e]">Escolha seu plano</h1>
        <p className="text-gray-600 mt-2">
          Proteja seu trabalho com contratos jurídicos gerados por IA.
          <br />
          Aceito: PIX, cartão de crédito (até 12x) e boleto.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANOS.map((plano) => (
          <div
            key={plano.id}
            className={`bg-white rounded-2xl border-2 p-6 flex flex-col transition-all ${
              plano.destaque
                ? 'border-[#c9a84c] shadow-lg shadow-[#c9a84c]/10'
                : 'border-[#d4c9b8]'
            }`}
          >
            {plano.destaque && (
              <div className="bg-[#c9a84c] text-black text-xs font-bold px-3 py-1 rounded-full self-start mb-3">
                MAIS POPULAR
              </div>
            )}
            <div className="mb-5">
              <h2 className="text-lg font-bold text-[#0e0e0e]">{plano.nome}</h2>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-[#0e0e0e]">R${plano.preco}</span>
                <span className="text-sm text-gray-500">/{plano.periodo}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{plano.descricao}</p>
            </div>

            <ul className="space-y-2 flex-1 mb-6">
              {plano.recursos.map((recurso) => (
                <li key={recurso} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="text-[#c9a84c] font-bold">✓</span>
                  {recurso}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleComprar(plano.id)}
              disabled={loading === plano.id}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                plano.destaque
                  ? 'bg-[#c9a84c] hover:bg-[#b8963e] text-black'
                  : 'bg-[#0e0e0e] hover:bg-[#1a1a1a] text-white'
              } disabled:opacity-50`}
            >
              {loading === plano.id ? 'Aguarde...' : `Assinar ${plano.nome}`}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>💳 Pagamento seguro via Mercado Pago · Cancele quando quiser</p>
        <p className="mt-1">
          Dúvidas?{' '}
          <a href="mailto:suporte@contratoIA.com.br" className="text-[#c9a84c] hover:underline">
            suporte@contratoIA.com.br
          </a>
        </p>
      </div>
    </div>
  )
}
