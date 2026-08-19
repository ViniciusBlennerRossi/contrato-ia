import Link from 'next/link'
import { getUser } from '@/lib/dal'
import { db } from '@/lib/db'
import { rotuloDoPlano, saldoDeContratos } from '@/lib/planos'
import { TIPOS_CONTRATO } from '@/lib/contratos/tipos'

const NOME_DO_TIPO = new Map(TIPOS_CONTRATO.map((t) => [t.id, t.nome]))

export default async function DashboardPage() {
  const user = await getUser()
  if (!user) return null

  const contratos = await db.contract.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  const saldo = saldoDeContratos(user.plan, user.contractsUsed, user.bonusContracts)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#0e0e0e]">
          Olá, {user.name?.split(' ')[0] ?? 'usuário'} 👋
        </h1>
        <p className="text-gray-600 mt-1">Gerencie seus contratos e seu plano</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-[#d4c9b8] rounded-xl p-5">
          <div className="text-sm text-gray-500 mb-1">Contratos gerados</div>
          <div className="text-3xl font-bold text-[#0e0e0e]">{saldo.usados}</div>
          {saldo.ilimitado ? (
            <div className="text-xs text-[#c9a84c] mt-1">Ilimitado ✓</div>
          ) : (
            <>
              <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#c9a84c] rounded-full transition-all"
                  style={{ width: `${saldo.percentualUso}%` }}
                />
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {saldo.usados} de {saldo.capacidadeFormatada} contratos
              </div>
              {saldo.bonus > 0 && (
                <div className="text-xs text-[#c9a84c] mt-0.5">
                  Inclui {saldo.bonus} {saldo.bonus === 1 ? 'contrato bônus' : 'contratos bônus'}
                </div>
              )}
            </>
          )}
        </div>

        <div className="bg-white border border-[#d4c9b8] rounded-xl p-5">
          <div className="text-sm text-gray-500 mb-1">Seu plano</div>
          <div className="text-2xl font-bold text-[#0e0e0e]">{rotuloDoPlano(user.plan)}</div>
          <Link href="/assinatura" className="text-xs text-[#c9a84c] hover:underline mt-1 block">
            {user.plan === 'FREE' ? 'Fazer upgrade →' : 'Gerenciar plano →'}
          </Link>
        </div>

        <div className="bg-white border border-[#d4c9b8] rounded-xl p-5">
          <div className="text-sm text-gray-500 mb-1">Novo contrato</div>
          <div className="text-sm text-gray-600 mb-3">Gere um contrato em segundos</div>
          <Link
            href="/gerar"
            className="inline-block bg-[#c9a84c] hover:bg-[#b8963e] text-black font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
          >
            ⚡ Gerar agora
          </Link>
        </div>
      </div>

      {saldo.restantes === 0 && !saldo.ilimitado && (
        <div className="bg-[#c9a84c]/10 border border-[#c9a84c]/30 rounded-xl p-5 mb-8 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1">
            <div className="font-semibold text-[#0e0e0e]">
              {saldo.capacidade === 0
                ? 'Libere o poder do ContratoIA'
                : 'Seus contratos acabaram'}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {saldo.capacidade === 0
                ? 'Você está no plano gratuito. Escolha um plano para gerar contratos com IA.'
                : 'Você usou todos os contratos do seu plano. Faça upgrade para continuar gerando.'}
            </div>
          </div>
          <Link
            href="/assinatura"
            className="bg-[#c9a84c] hover:bg-[#b8963e] text-black font-semibold text-sm px-5 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            Ver planos →
          </Link>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#0e0e0e]">Contratos recentes</h2>
          <Link href="/gerar" className="text-sm text-[#c9a84c] hover:underline">
            + Novo contrato
          </Link>
        </div>

        {contratos.length === 0 ? (
          <div className="bg-white border border-[#d4c9b8] rounded-xl p-12 text-center">
            <div className="text-4xl mb-3">📄</div>
            <div className="text-gray-600 font-medium">Nenhum contrato ainda</div>
            <div className="text-gray-400 text-sm mt-1 mb-5">
              Gere seu primeiro contrato com IA em segundos
            </div>
            <Link
              href="/gerar"
              className="bg-[#c9a84c] hover:bg-[#b8963e] text-black font-semibold text-sm px-5 py-2 rounded-lg transition-colors"
            >
              ⚡ Gerar primeiro contrato
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {contratos.map((contrato) => (
              <div
                key={contrato.id}
                className="bg-white border border-[#d4c9b8] rounded-xl p-4 flex items-center justify-between hover:border-[#c9a84c]/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[#0e0e0e] text-sm truncate">{contrato.title}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {NOME_DO_TIPO.get(contrato.type) ?? contrato.type} ·{' '}
                    {new Date(contrato.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <Link
                  href={`/contrato/${contrato.id}`}
                  className="ml-4 text-xs text-[#c9a84c] hover:underline whitespace-nowrap"
                >
                  Ver →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
