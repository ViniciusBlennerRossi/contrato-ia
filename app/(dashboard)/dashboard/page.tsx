import Link from 'next/link'
import { getUser } from '@/lib/dal'
import { db } from '@/lib/db'

const PLAN_LIMITS: Record<string, number> = {
  FREE: 0,
  AVULSO: 1,
  MENSAL: 10,
  PROFISSIONAL: Infinity,
}

const TIPO_LABELS: Record<string, string> = {
  'prestacao-servicos': 'Prestação de Serviços',
  'confidencialidade': 'NDA',
  'parceria-comercial': 'Parceria Comercial',
  'locacao-comercial': 'Locação Comercial',
  'compra-venda': 'Compra e Venda',
  'contrato-trabalho': 'Trabalho',
  'permuta': 'Permuta',
  'representacao-comercial': 'Representação Comercial',
  'influencer-marketing': 'Influencer',
  'desenvolvimento-software': 'Desenvolvimento Software',
  'cessao-direitos-autorais': 'Direitos Autorais',
  'coaching-mentoria': 'Coaching',
  'locacao-residencial': 'Locação Residencial',
  'comodato': 'Comodato',
  'empreitada-reforma': 'Empreitada',
  'licenca-software': 'Licença Software',
}

export default async function DashboardPage() {
  const user = await getUser()
  if (!user) return null

  const contratos = await db.contract.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  const limite = PLAN_LIMITS[user.plan] ?? 0
  const percentualUso = limite === Infinity ? 0 : limite === 0 ? 100 : (user.contractsUsed / limite) * 100

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
          <div className="text-3xl font-bold text-[#0e0e0e]">{user.contractsUsed}</div>
          {limite !== Infinity && (
            <>
              <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#c9a84c] rounded-full transition-all"
                  style={{ width: `${Math.min(percentualUso, 100)}%` }}
                />
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {user.contractsUsed} de {limite} contratos
              </div>
            </>
          )}
          {limite === Infinity && (
            <div className="text-xs text-[#c9a84c] mt-1">Ilimitado ✓</div>
          )}
        </div>

        <div className="bg-white border border-[#d4c9b8] rounded-xl p-5">
          <div className="text-sm text-gray-500 mb-1">Seu plano</div>
          <div className="text-2xl font-bold text-[#0e0e0e] capitalize">{user.plan.toLowerCase()}</div>
          <Link href="/assinatura" className="text-xs text-[#c9a84c] hover:underline mt-1 block">
            {user.plan === 'FREE' ? 'Fazer upgrade →' : 'Gerenciar plano →'}
          </Link>
        </div>

        <div className="bg-white border border-[#d4c9b8] rounded-xl p-5">
          <div className="text-sm text-gray-500 mb-1">Novo contrato</div>
          <div className="text-sm text-gray-600 mb-3">Gere um contrato em 30 segundos</div>
          <Link
            href="/gerar"
            className="inline-block bg-[#c9a84c] hover:bg-[#b8963e] text-black font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
          >
            ⚡ Gerar agora
          </Link>
        </div>
      </div>

      {user.plan === 'FREE' && (
        <div className="bg-[#c9a84c]/10 border border-[#c9a84c]/30 rounded-xl p-5 mb-8 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1">
            <div className="font-semibold text-[#0e0e0e]">Libere o poder do ContratoIA</div>
            <div className="text-sm text-gray-600 mt-1">
              Você está no plano gratuito. Faça upgrade para gerar contratos com IA.
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
              Gere seu primeiro contrato com IA em 30 segundos
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
                    {TIPO_LABELS[contrato.type] ?? contrato.type} ·{' '}
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
