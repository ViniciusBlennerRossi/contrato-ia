'use client'

import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { login } from '@/app/actions/auth'
import { Suspense } from 'react'

function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined)
  const searchParams = useSearchParams()
  const redefinido = searchParams.get('redefinido') === '1'

  return (
    <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-[#c9a84c] text-2xl">⚖️</span>
            <span className="text-white text-xl font-semibold tracking-wide">ContratoIA</span>
          </Link>
          <h1 className="text-white text-2xl font-semibold">Entrar na sua conta</h1>
          <p className="text-gray-400 mt-2 text-sm">
            Não tem conta?{' '}
            <Link href="/cadastro" className="text-[#c9a84c] hover:underline">
              Criar gratuitamente
            </Link>
          </p>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8">
          {redefinido && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
              Senha redefinida com sucesso! Faça login com sua nova senha.
            </div>
          )}
          {state?.message && (
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

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm text-gray-300">Senha</label>
                <Link href="/esqueci-senha" className="text-xs text-[#c9a84c] hover:underline">
                  Esqueci minha senha
                </Link>
              </div>
              <input
                name="password"
                type="password"
                placeholder="Sua senha"
                className="w-full bg-[#111] border border-[#333] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#c9a84c] transition-colors"
                required
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
              {pending ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#2a2a2a]" />
              </div>
              <div className="relative flex justify-center text-xs text-gray-500">
                <span className="bg-[#1a1a1a] px-3">ou continue com</span>
              </div>
            </div>

            <a
              href="/api/auth/google"
              className="mt-4 w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-medium rounded-lg py-2.5 text-sm transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Entrar com Google
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
