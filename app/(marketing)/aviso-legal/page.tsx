import Link from 'next/link'

export default function AvisoLegalPage() {
  return (
    <div className="bg-[#080808] text-[#f8f4ef] min-h-screen px-6 md:px-16 py-20">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-xs text-[#c8a84b] tracking-widest uppercase hover:underline">
          ← Voltar
        </Link>

        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-semibold mt-8 mb-2">
          Aviso Legal
        </h1>
        <p className="text-sm text-gray-500 mb-12">Última atualização: maio de 2026</p>

        <div className="space-y-10 text-sm text-gray-300 leading-relaxed">

          <section>
            <h2 className="text-white font-semibold text-base mb-3">1. Natureza do serviço</h2>
            <p>
              A ContratoIA é uma plataforma de tecnologia que disponibiliza <strong className="text-white">modelos genéricos de documentos jurídicos</strong> gerados com auxílio de inteligência artificial, para fins auxiliares e informativos.
            </p>
            <p className="mt-3">
              Os documentos disponibilizados são modelos padronizados de caráter geral, elaborados com linguagem jurídica brasileira baseada no Código Civil e legislações pertinentes. Funcionam de forma análoga a formulários, livros jurídicos, e-books ou kits de documentos, sem análise individualizada do caso concreto do usuário.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">2. O que a ContratoIA não é</h2>
            <p>A ContratoIA <strong className="text-white">não presta serviços jurídicos</strong>, não realiza consultoria, assessoria ou direção jurídica, e não substitui o advogado. A plataforma:</p>
            <ul className="mt-3 space-y-2 list-none">
              {[
                'Não analisa o caso concreto do usuário',
                'Não garante a adequação do modelo à situação específica',
                'Não oferece parecer ou opinião jurídica',
                'Não representa o usuário em qualquer instância',
                'Não garante validade jurídica em todas as situações',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">✕</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">3. Recomendação de uso</h2>
            <p>
              Os modelos disponibilizados são adequados para situações cotidianas de baixa complexidade, como formalização de relações de trabalho simples, prestação de serviços rotineiros e acordos básicos entre partes.
            </p>
            <p className="mt-3">
              <strong className="text-white">Recomendamos fortemente a revisão por advogado habilitado</strong> antes da assinatura em situações que envolvam:
            </p>
            <ul className="mt-3 space-y-2 list-none">
              {[
                'Valores financeiros relevantes',
                'Riscos patrimoniais significativos',
                'Cláusulas complexas ou atípicas',
                'Relações societárias ou de longo prazo',
                'Propriedade intelectual de alto valor',
                'Qualquer dúvida sobre a adequação jurídica do instrumento',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-[#c8a84b] mt-0.5">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">4. Isenção de responsabilidade</h2>
            <p>
              A ContratoIA não se responsabiliza por eventuais prejuízos decorrentes do uso dos modelos sem a devida adequação ao caso concreto, sem revisão profissional quando necessária, ou em situações que exijam análise jurídica individualizada.
            </p>
            <p className="mt-3">
              O usuário reconhece que os documentos gerados são modelos genéricos e assume inteira responsabilidade pela decisão de utilizá-los sem revisão jurídica prévia.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">5. Aviso padrão nos documentos gerados</h2>
            <div className="border border-[#c8a84b]/30 bg-[#c8a84b]/5 p-5 rounded">
              <p className="text-gray-200 italic">
                "Os documentos disponibilizados pela ContratoIA são modelos genéricos elaborados para fins auxiliares. A utilização deve ser precedida, quando necessário, por análise do caso concreto por advogado habilitado, especialmente quando houver valores relevantes, riscos patrimoniais, cláusulas complexas ou dúvidas sobre a adequação jurídica do instrumento."
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">6. Conformidade com o Estatuto da OAB</h2>
            <p>
              A ContratoIA opera em conformidade com o Estatuto da Advocacia (Lei nº 8.906/1994). A plataforma não exerce atividades privativas da advocacia, tais como consultoria, assessoria ou direção jurídicas, nem postulação em juízo. Os modelos disponibilizados são instrumentos de apoio documental, não constituindo serviço jurídico profissional.
            </p>
          </section>

          <section className="border-t border-[#2a2a2a] pt-8">
            <p className="text-gray-500 text-xs">
              Dúvidas sobre este aviso? Entre em contato:{' '}
              <a href="mailto:empresa.v3app@gmail.com" className="text-[#c8a84b] hover:underline">
                empresa.v3app@gmail.com
              </a>
            </p>
            <div className="flex gap-4 mt-4 text-xs text-gray-600">
              <Link href="/termos" className="hover:text-white transition-colors">Termos de Uso</Link>
              <Link href="/privacidade" className="hover:text-white transition-colors">Política de Privacidade</Link>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
