'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const OWNER_EMAIL = 'viniciusblenner@gmail.com'

type Usuario = {
  id: string
  name: string | null
  email: string
  plan: string
  contractsUsed: number
  bonusContracts: number
  createdAt: string
}

export default function AdminPage() {
  const [email, setEmail] = useState('')
  const [resultado, setResultado] = useState<Usuario | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState<string | null>(null)
  const router = useRouter()

  async function buscarUsuario() {
    setErro(null)
    setResultado(null)
    const res = await fetch(`/api/admin/usuario?email=${encodeURIComponent(email)}`)
    const json = await res.json()
    if (!res.ok) { setErro(json.error); return }
    setResultado(json.usuario)
  }

  async function salvar() {
    if (!resultado) return
    setSalvando(true)
    setMensagem(null)
    const res = await fetch('/api/admin/usuario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: resultado.id,
        plan: resultado.plan,
        bonusContracts: resultado.bonusContracts,
        contractsUsed: resultado.contractsUsed,
      }),
    })
    const json = await res.json()
    setSalvando(false)
    if (!res.ok) { setErro(json.error); return }
    setMensagem('Salvo com sucesso!')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#0e0e0e]">Admin — Gerenciar Usuários</h1>
        <p className="text-sm text-gray-500 mt-1">Altere plano, bônus e uso dos usuários</p>
      </div>

      <div className="bg-white border border-[#d4c9b8] rounded-xl p-6 mb-6">
        <label className="block text-sm text-gray-600 mb-1.5">Buscar por e-mail</label>
        <div className="flex gap-2">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && buscarUsuario()}
            placeholder="cliente@email.com"
            className="flex-1 border border-[#d4c9b8] rounded-lg px-3 py-2 text-sm text-[#0e0e0e] focus:outline-none focus:border-[#c9a84c]"
          />
          <button
            onClick={buscarUsuario}
            className="bg-[#0e0e0e] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#1a1a1a] transition-colors"
          >
            Buscar
          </button>
        </div>
        {erro && <p className="text-red-500 text-sm mt-2">{erro}</p>}
      </div>

      {resultado && (
        <div className="bg-white border border-[#d4c9b8] rounded-xl p-6 space-y-4">
          <div>
            <p className="text-xs text-gray-400">Nome</p>
            <p className="text-sm font-medium text-[#0e0e0e]">{resultado.name ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">E-mail</p>
            <p className="text-sm text-[#0e0e0e]">{resultado.email}</p>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Plano</label>
            <select
              value={resultado.plan}
              onChange={(e) => setResultado({ ...resultado, plan: e.target.value })}
              className="border border-[#d4c9b8] rounded-lg px-3 py-2 text-sm text-[#0e0e0e] focus:outline-none focus:border-[#c9a84c] bg-white"
            >
              <option value="FREE">FREE</option>
              <option value="AVULSO">AVULSO (1 contrato)</option>
              <option value="MENSAL">MENSAL (10/mês)</option>
              <option value="PROFISSIONAL">PROFISSIONAL (ilimitado)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Contratos bônus (extras além do plano)</label>
            <input
              type="number"
              min={0}
              value={resultado.bonusContracts}
              onChange={(e) => setResultado({ ...resultado, bonusContracts: Number(e.target.value) })}
              className="border border-[#d4c9b8] rounded-lg px-3 py-2 text-sm text-[#0e0e0e] focus:outline-none focus:border-[#c9a84c] w-32"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Contratos usados (zere para resetar)</label>
            <input
              type="number"
              min={0}
              value={resultado.contractsUsed}
              onChange={(e) => setResultado({ ...resultado, contractsUsed: Number(e.target.value) })}
              className="border border-[#d4c9b8] rounded-lg px-3 py-2 text-sm text-[#0e0e0e] focus:outline-none focus:border-[#c9a84c] w-32"
            />
          </div>

          {mensagem && <p className="text-green-600 text-sm">{mensagem}</p>}

          <button
            onClick={salvar}
            disabled={salvando}
            className="w-full bg-[#c9a84c] hover:bg-[#b8963e] disabled:opacity-60 text-black font-semibold py-2.5 rounded-xl text-sm transition-colors"
          >
            {salvando ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      )}
    </div>
  )
}
