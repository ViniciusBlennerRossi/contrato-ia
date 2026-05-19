'use client'

import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { redefinirSenha } from '@/app/actions/auth'
import { Suspense } from 'react'

function RedefinirSenhaForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [state, action, pending] = useActionState(redefinirSenha, undefined)

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <div className="text-4xl">❌</div>
        <p className="text-red-400 font-medium">Link inválido</p>
        <p className="text-gray-400 text-sm">
          Este link de redefinição é inválido. Solicite um novo.
        </p>
        <Link href="/esqueci-senha" className="block mt-4 text-sm text-[#c9a84c] hover:underline">
          Solicitar novo link
        </Link>
      </div>
    )
  }

  return (
    <>
      {state?.message && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {state.message}{' '}
          {state.message.includes('expirou') || state.message.includes('inválido') ? (
            <Link href="/esqueci-senha" className="underline">
              Solicitar novo link
            </Link>
          ) : null}
        </div>
      )}

      <form action={action} className="space-y-4">
        <input type="hidden" name="token" value={token} />

        <div>
          <label className="block text-sm text-gray-300 mb-1.5">Nova senha</label>
          <input
            name="password"
            type="password"
            placeholder="Mínimo 8 caracteres"
            className="w-full bg-[#111] border border-[#333] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#c9a84c] transition-colors"
            required
            minLength={8}
          />
          {state?.errors?.password && (
            <p className="mt-1 text-xs text-red-400">{state.errors.password[0]}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-[#c9a84c] hover:bg-[#b8963e] disabled:opacity-50 text-black font-semibold rounded-lg py-2.5 text-sm transition-colors mt-2"
        >
          {pending ? 'Salvando...' : 'Salvar nova senha'}
        </button>
      </form>
    </>
  )
}

export default function RedefinirSenhaPage() {
  return (
    <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-[#c9a84c] text-2xl">⚖️</span>
            <span className="text-white text-xl font-semibold tracking-wide">ContratoIA</span>
          </Link>
          <h1 className="text-white text-2xl font-semibold">Criar nova senha</h1>
          <p className="text-gray-400 mt-2 text-sm">
            Escolha uma nova senha para sua conta.
          </p>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8">
          <Suspense fallback={<p className="text-gray-400 text-sm text-center">Carregando...</p>}>
            <RedefinirSenhaForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
