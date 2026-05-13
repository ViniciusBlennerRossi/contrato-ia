import Link from 'next/link'
import { getUser } from '@/lib/dal'
import { logout } from '@/app/actions/auth'

const PLAN_LABELS: Record<string, string> = {
  FREE: 'Gratuito',
  AVULSO: 'Avulso',
  MENSAL: 'Mensal',
  PROFISSIONAL: 'Profissional',
}

const PLAN_LIMITS: Record<string, string> = {
  FREE: '0',
  AVULSO: '1',
  MENSAL: '10',
  PROFISSIONAL: '∞',
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()

  if (!user) return null

  const planLabel = PLAN_LABELS[user.plan] ?? 'Gratuito'
  const planLimit = PLAN_LIMITS[user.plan] ?? '0'

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col">
      <header className="bg-[#0e0e0e] border-b border-[#2a2a2a] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-[#c9a84c] text-lg">⚖️</span>
              <span className="text-white font-semibold tracking-wide">ContratoIA</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/dashboard"
                className="text-gray-400 hover:text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
              >
                Histórico
              </Link>
              <Link
                href="/gerar"
                className="text-gray-400 hover:text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
              >
                Gerar Contrato
              </Link>
              <Link
                href="/assinatura"
                className="text-gray-400 hover:text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
              >
                Meu Plano
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs">
              <span className="bg-[#c9a84c]/20 text-[#c9a84c] px-2 py-1 rounded-full font-medium">
                {planLabel}
              </span>
              <span className="text-gray-500">
                {user.contractsUsed}/{planLimit} contratos
              </span>
            </div>
            <div className="flex items-center gap-2">
              {user.image ? (
                <img src={user.image} alt={user.name ?? ''} className="w-7 h-7 rounded-full" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#c9a84c] flex items-center justify-center text-black text-xs font-bold">
                  {(user.name ?? user.email)[0].toUpperCase()}
                </div>
              )}
              <span className="text-white text-sm hidden md:block">{user.name ?? user.email}</span>
            </div>
            <form action={logout}>
              <button type="submit" className="text-gray-400 hover:text-white text-xs transition-colors">
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {children}
      </main>
    </div>
  )
}
