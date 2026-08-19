'use client'

import { useState } from 'react'
import { PLANOS_A_VENDA, precoEmReais } from '@/lib/planos'

const EMAIL_SUPORTE = 'empresa.v3app@gmail.com'

export default function AssinaturaPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  async function handleComprar(planoId: string) {
    setLoading(planoId)
    setErro(null)
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
        setErro(json.error ?? 'Não foi possível abrir o pagamento. Tente novamente.')
      }
    } catch {
      setErro('Falha de conexão ao abrir o pagamento. Tente novamente.')
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
          Pagamento com cartão de crédito.
        </p>
      </div>

      {erro && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
          {erro}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANOS_A_VENDA.map((plano) => (
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
              <h2 className="text-lg font-bold text-[#0e0e0e]">{plano.rotulo}</h2>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-[#0e0e0e]">
                  R${precoEmReais(plano.id)}
                </span>
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
              {loading === plano.id ? 'Aguarde...' : `Assinar ${plano.rotulo}`}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>💳 Pagamento seguro via Stripe · Cancele quando quiser</p>
        <p className="mt-1">
          Dúvidas?{' '}
          <a href={`mailto:${EMAIL_SUPORTE}`} className="text-[#c9a84c] hover:underline">
            {EMAIL_SUPORTE}
          </a>
        </p>
      </div>
    </div>
  )
}
