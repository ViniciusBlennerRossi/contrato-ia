'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { solicitarRedefinicao } from '@/app/actions/auth'

export default function EsqueciSenhaPage() {
  const [state, action, pending] = useActionState(solicitarRedefinicao, undefined)
  const enviado = state?.message?.includes('receberá')

  return (
    <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-[#c9a84c] text-2xl">⚖️</span>
            <span className="text-white text-xl font-semibold tracking-wide">ContratoIA</span>
          </Link>
          <h1 className="text-white text-2xl font-semibold">Esqueci minha senha</h1>
          <p className="text-gray-400 mt-2 text-sm">
            Informe seu email e enviaremos um link para redefinir sua senha.
          </p>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8">
          {enviado ? (
            <div className="text-center space-y-4">
              <div className="text-4xl">📬</div>
              <p className="text-green-400 font-medium">Email enviado!</p>
              <p className="text-gray-400 text-sm">
                {state?.message}
              </p>
              <Link
                href="/login"
                className="block mt-4 text-sm text-[#c9a84c] hover:underline"
              >
                ← Voltar para o login
              </Link>
            </div>
          ) : (
            <>
              {state?.message && !enviado && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {state.message}
                </div>
              )}

              <form action={action} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">Email</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="w-full bg-[#111] border border-[#333] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#c9a84c] transition-colors"
                    required
                  />
                  {state?.errors?.email && (
                    <p className="mt-1 text-xs text-red-400">{state.errors.email[0]}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={pending}
                  className="w-full bg-[#c9a84c] hover:bg-[#b8963e] disabled:opacity-50 text-black font-semibold rounded-lg py-2.5 text-sm transition-colors mt-2"
                >
                  {pending ? 'Enviando...' : 'Enviar link de redefinição'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-500">
                Lembrou a senha?{' '}
                <Link href="/login" className="text-[#c9a84c] hover:underline">
                  Entrar
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
