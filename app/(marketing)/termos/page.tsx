'use client'

import Link from 'next/link'

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white">
      <header className="border-b border-[#1a1a1a] py-4 px-6">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <span className="text-[#c9a84c] text-xl">⚖️</span>
          <span className="text-white text-lg font-semibold tracking-wide">ContratoIA</span>
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-2">Termos de Uso</h1>
        <p className="text-gray-400 text-sm mb-10">Última atualização: maio de 2026</p>

        <div className="space-y-8 text-gray-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Aceitação dos termos</h2>
            <p>
              Ao criar uma conta ou utilizar o ContratoIA, você concorda com estes Termos de Uso.
              Se não concordar com algum ponto, não utilize o serviço.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Descrição do serviço</h2>
            <p>
              O ContratoIA é uma plataforma de geração automatizada de contratos jurídicos utilizando
              inteligência artificial. Os contratos gerados são modelos baseados na legislação brasileira
              e servem como ponto de partida para formalização de acordos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Limitações legais</h2>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-3">
              <p className="text-yellow-300 font-medium">⚠️ Aviso importante</p>
            </div>
            <ul className="list-disc pl-5 space-y-2">
              <li>Os contratos gerados pelo ContratoIA são <strong className="text-white">modelos automatizados</strong> e não substituem a consultoria de um advogado.</li>
              <li>Para contratos de alto valor ou alta complexidade, recomendamos a revisão por um profissional jurídico.</li>
              <li>O ContratoIA não se responsabiliza por consequências jurídicas decorrentes do uso dos contratos gerados sem revisão profissional.</li>
              <li>Os contratos gerados são baseados na legislação brasileira vigente na data de geração.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Planos e pagamentos</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-white">Plano Avulso (R$29):</strong> 1 contrato, acesso por 30 dias ao histórico.</li>
              <li><strong className="text-white">Plano Mensal (R$47/mês):</strong> 10 contratos por mês, renovação automática.</li>
              <li><strong className="text-white">Plano Profissional (R$197/mês):</strong> contratos ilimitados, renovação automática.</li>
              <li>Pagamentos processados pelo Mercado Pago com segurança.</li>
              <li>Assinaturas podem ser canceladas a qualquer momento, com acesso mantido até o fim do período pago.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Reembolsos</h2>
            <p>
              Solicitações de reembolso podem ser feitas em até <strong className="text-white">7 dias corridos</strong> após
              a compra, conforme o Código de Defesa do Consumidor (Art. 49, Lei 8.078/1990), desde que
              o serviço não tenha sido utilizado. Entre em contato pelo e-mail{' '}
              <a href="mailto:empresa.v3app@gmail.com" className="text-[#c9a84c] hover:underline">
                empresa.v3app@gmail.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Uso aceitável</h2>
            <p>É proibido utilizar o ContratoIA para:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Gerar contratos com conteúdo ilegal, fraudulento ou que viole direitos de terceiros</li>
              <li>Realizar engenharia reversa ou tentativas de acesso não autorizado ao sistema</li>
              <li>Revender ou redistribuir o serviço sem autorização expressa</li>
              <li>Uso automatizado massivo (bots) sem autorização prévia</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Propriedade intelectual</h2>
            <p>
              Os contratos gerados são de propriedade do usuário que os criou.
              A plataforma, seus algoritmos, design e código-fonte são de propriedade exclusiva do ContratoIA.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Disponibilidade do serviço</h2>
            <p>
              Nos comprometemos a manter a plataforma disponível, mas não garantimos disponibilidade
              ininterrupta. Manutenções programadas serão avisadas com antecedência.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Modificações nos termos</h2>
            <p>
              Podemos atualizar estes termos a qualquer momento. O uso continuado do serviço após
              as alterações implica aceitação dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Foro e legislação</h2>
            <p>
              Estes termos são regidos pela legislação brasileira. Fica eleito o foro da comarca
              de São Paulo/SP para resolução de conflitos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Contato</h2>
            <p>
              Dúvidas:{' '}
              <a href="mailto:empresa.v3app@gmail.com" className="text-[#c9a84c] hover:underline">
                empresa.v3app@gmail.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-[#1a1a1a] flex gap-6 text-sm">
          <Link href="/privacidade" className="text-[#c9a84c] hover:underline">Política de Privacidade</Link>
          <Link href="/" className="text-gray-400 hover:text-white">← Voltar ao início</Link>
        </div>
      </main>
    </div>
  )
}
