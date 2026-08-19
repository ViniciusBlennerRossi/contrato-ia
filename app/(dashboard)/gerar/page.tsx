'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TIPOS_CONTRATO } from '@/lib/contratos/tipos'
import { imprimirContrato } from '@/lib/imprimirContrato'

type Contrato = { id: string; titulo: string; conteudo: string }
type EstadoSalvamento = 'limpo' | 'salvando' | 'salvo' | 'erro'

const FORMAS_PAGAMENTO = ['PIX', 'Boleto', 'TED/DOC', 'Cartão de Crédito', 'Dinheiro', 'À combinar']

const CLASSE_CAMPO =
  'w-full border border-[#d4c9b8] rounded-lg px-3 py-2.5 text-sm text-[#0e0e0e] focus:outline-none focus:border-[#c9a84c] transition-colors'

export default function GerarPage() {
  const [tipoSelecionado, setTipoSelecionado] = useState(TIPOS_CONTRATO[0].id)
  const [carregando, setCarregando] = useState(false)
  const [contrato, setContrato] = useState<Contrato | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)
  const [salvamento, setSalvamento] = useState<EstadoSalvamento>('limpo')

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
      setSalvamento('limpo')
    } catch {
      setErro('Falha de conexão. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  /** Grava a edição no banco. Sem isso o texto ajustado se perdia ao sair da tela. */
  async function salvarEdicao(atual: Contrato): Promise<boolean> {
    setSalvamento('salvando')
    try {
      const res = await fetch(`/api/contratos/${atual.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: atual.conteudo }),
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
    navigator.clipboard.writeText(contrato.conteudo)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  function imprimir() {
    if (!contrato) return
    const abriu = imprimirContrato(contrato.titulo, contrato.conteudo)
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

  const tipoAtual = TIPOS_CONTRATO.find((t) => t.id === tipoSelecionado)

  const avisoSalvamento = {
    limpo: 'Clique no texto para editar',
    salvando: 'Salvando…',
    salvo: 'Edições salvas ✓',
    erro: 'Não foi possível salvar. Tente editar de novo.',
  }[salvamento]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#0e0e0e]">⚡ Gerar Contrato com IA</h1>
        <p className="text-gray-600 mt-1 text-sm">
          Preencha os dados abaixo e receba seu contrato em segundos
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
            {tipoAtual && <p className="mt-3 text-xs text-gray-500">ℹ️ {tipoAtual.descricao}</p>}
          </div>

          <div className="bg-white border border-[#d4c9b8] rounded-xl p-6">
            <h2 className="font-semibold text-[#0e0e0e] mb-4">2. Dados das partes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">
                  Contratante (quem contrata)
                </label>
                <input name="contratante" required maxLength={200} placeholder="Nome ou empresa" className={CLASSE_CAMPO} />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">CPF/CNPJ do Contratante</label>
                <input
                  name="cpfCnpjContratante"
                  required
                  maxLength={30}
                  placeholder="000.000.000-00 ou 00.000.000/0001-00"
                  className={CLASSE_CAMPO}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">Contratado (quem presta)</label>
                <input name="contratado" required maxLength={200} placeholder="Nome ou empresa" className={CLASSE_CAMPO} />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">CPF/CNPJ do Contratado</label>
                <input
                  name="cpfCnpjContratado"
                  required
                  maxLength={30}
                  placeholder="000.000.000-00 ou 00.000.000/0001-00"
                  className={CLASSE_CAMPO}
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#d4c9b8] rounded-xl p-6">
            <h2 className="font-semibold text-[#0e0e0e] mb-4">3. Detalhes do contrato</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">Valor (R$)</label>
                <input name="valor" maxLength={40} placeholder="Ex: 5.000,00" className={CLASSE_CAMPO} />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">Duração / Prazo</label>
                <input
                  name="duracao"
                  maxLength={80}
                  placeholder="Ex: 6 meses, 12 meses, indeterminado"
                  className={CLASSE_CAMPO}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">Cidade</label>
                <input name="cidade" maxLength={80} placeholder="São Paulo" className={CLASSE_CAMPO} />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">Estado</label>
                <input name="estado" placeholder="SP" maxLength={2} className={CLASSE_CAMPO} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-gray-600 mb-1.5">Forma de Pagamento</label>
                <select name="formaPagamento" className={`${CLASSE_CAMPO} bg-white`}>
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
                maxLength={2000}
                placeholder="Descreva detalhadamente o que será contratado, entregue ou realizado..."
                className={`${CLASSE_CAMPO} resize-y`}
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
          {erro && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {erro}
            </div>
          )}

          <div className="bg-white border border-[#d4c9b8] rounded-xl overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-[#d4c9b8] bg-[#f9f6f0]">
              <div className="min-w-0">
                <h2 className="font-semibold text-[#0e0e0e] text-sm truncate">{contrato.titulo}</h2>
                <p
                  className={`text-xs mt-0.5 ${
                    salvamento === 'erro' ? 'text-red-500' : 'text-gray-500'
                  }`}
                >
                  {avisoSalvamento}
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
            <div className="p-2">
              <textarea
                value={contrato.conteudo}
                onChange={(e) => {
                  setContrato({ ...contrato, conteudo: e.target.value })
                  setSalvamento('limpo')
                }}
                onBlur={() => salvarEdicao(contrato)}
                className="w-full min-h-[600px] p-4 font-serif text-sm text-[#0e0e0e] leading-relaxed border-0 outline-none resize-y bg-white"
                spellCheck={false}
              />
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={() => {
                setContrato(null)
                setErro(null)
              }}
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
