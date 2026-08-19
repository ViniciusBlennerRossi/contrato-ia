import Link from 'next/link'
import Image from 'next/image'
import { getUser } from '@/lib/dal'
import { logout } from '@/app/actions/auth'
import { rotuloDoPlano, saldoDeContratos } from '@/lib/planos'

const DESTINOS = [
  { href: '/dashboard', rotulo: 'Histórico', icone: '📄' },
  { href: '/gerar', rotulo: 'Gerar', icone: '⚡' },
  { href: '/assinatura', rotulo: 'Meu Plano', icone: '💳' },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()

  if (!user) return null

  const saldo = saldoDeContratos(user.plan, user.contractsUsed, user.bonusContracts)

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
              {DESTINOS.map((destino) => (
                <Link
                  key={destino.href}
                  href={destino.href}
                  className="text-gray-400 hover:text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
                >
                  {destino.rotulo === 'Gerar' ? 'Gerar Contrato' : destino.rotulo}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="bg-[#c9a84c]/20 text-[#c9a84c] px-2 py-1 rounded-full font-medium">
                {rotuloDoPlano(user.plan)}
              </span>
              <span className="text-gray-500">
                {saldo.usados}/{saldo.ilimitado ? '∞' : saldo.capacidadeFormatada} contratos
              </span>
            </div>
            <div className="flex items-center gap-2">
              {user.image ? (
                <Image
                  src={user.image}
                  alt=""
                  width={28}
                  height={28}
                  className="w-7 h-7 rounded-full"
                  unoptimized
                />
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

      {/* pb-24 no celular abre espaço para a barra fixa não cobrir o conteúdo */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 pb-24 md:pb-8">
        {children}
      </main>

      {/*
        No celular o menu do topo fica escondido e antes não havia substituto:
        o usuário logado não alcançava nenhuma tela do painel. Barra inferior em
        vez de menu sanduíche porque são só três destinos e é o padrão que o
        público de aplicativo já conhece.
      */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#0e0e0e] border-t border-[#2a2a2a]">
        <div className="grid grid-cols-3">
          {DESTINOS.map((destino) => (
            <Link
              key={destino.href}
              href={destino.href}
              className="flex flex-col items-center gap-0.5 py-2.5 text-gray-400 hover:text-white active:text-[#c9a84c] transition-colors"
            >
              <span className="text-lg leading-none" aria-hidden="true">{destino.icone}</span>
              <span className="text-[11px] font-medium">{destino.rotulo}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
