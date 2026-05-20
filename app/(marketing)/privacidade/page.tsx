'use client'

import Link from 'next/link'

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white">
      <header className="border-b border-[#1a1a1a] py-4 px-6">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <span className="text-[#c9a84c] text-xl">⚖️</span>
          <span className="text-white text-lg font-semibold tracking-wide">ContratoIA</span>
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-2">Política de Privacidade</h1>
        <p className="text-gray-400 text-sm mb-10">Última atualização: maio de 2026</p>

        <div className="space-y-8 text-gray-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Quem somos</h2>
            <p>
              O ContratoIA é um serviço de geração de contratos jurídicos por inteligência artificial,
              operado por V3App Tecnologia, com site em{' '}
              <a href="https://contratoia.v3app.com.br" className="text-[#c9a84c] hover:underline">
                contratoia.v3app.com.br
              </a>
              . Este documento explica quais dados coletamos, como os utilizamos e quais são seus direitos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Dados que coletamos</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-white">Dados de cadastro:</strong> nome, endereço de e-mail e senha (armazenada de forma criptografada).</li>
              <li><strong className="text-white">Dados de login social:</strong> quando você entra com o Google, recebemos seu nome, e-mail e foto de perfil públicos.</li>
              <li><strong className="text-white">Dados dos contratos:</strong> informações que você preenche nos formulários para gerar contratos (nomes, CPF/CNPJ, descrições).</li>
              <li><strong className="text-white">Dados de pagamento:</strong> processados diretamente pelo Mercado Pago. Não armazenamos dados de cartão de crédito.</li>
              <li><strong className="text-white">Dados de uso:</strong> logs de acesso, IP, tipo de navegador e páginas visitadas, para fins de segurança e melhoria do serviço.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Como usamos seus dados</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Criar e gerenciar sua conta</li>
              <li>Gerar os contratos solicitados por você</li>
              <li>Processar pagamentos e controlar seu plano de acesso</li>
              <li>Enviar comunicações transacionais (confirmações, alertas de conta)</li>
              <li>Melhorar a segurança e o desempenho da plataforma</li>
            </ul>
            <p className="mt-3">Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros para fins comerciais.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Compartilhamento de dados</h2>
            <p>Seus dados podem ser compartilhados apenas com:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong className="text-white">Mercado Pago:</strong> para processar pagamentos com segurança.</li>
              <li><strong className="text-white">Google:</strong> quando você usa o login social.</li>
              <li><strong className="text-white">Supabase:</strong> banco de dados onde seus contratos são armazenados com criptografia.</li>
              <li><strong className="text-white">Autoridades públicas:</strong> quando exigido por lei ou ordem judicial.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Segurança dos dados</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Senhas armazenadas com hash criptográfico (bcrypt)</li>
              <li>Comunicação protegida por HTTPS/TLS</li>
              <li>Sessões autenticadas com tokens JWT assinados</li>
              <li>Banco de dados hospedado na infraestrutura segura do Supabase</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Retenção de dados</h2>
            <p>
              Seus dados são mantidos enquanto sua conta estiver ativa. Ao solicitar exclusão da conta,
              removemos seus dados pessoais em até 30 dias, exceto quando exigida retenção por lei.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Seus direitos (LGPD)</h2>
            <p>Conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018), você tem direito a:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Confirmar a existência de tratamento dos seus dados</li>
              <li>Acessar seus dados</li>
              <li>Corrigir dados incompletos ou incorretos</li>
              <li>Solicitar anonimização ou exclusão dos dados</li>
              <li>Revogar consentimento a qualquer momento</li>
              <li>Portabilidade dos seus dados</li>
            </ul>
            <p className="mt-3">
              Para exercer seus direitos, entre em contato:{' '}
              <a href="mailto:empresa.v3app@gmail.com" className="text-[#c9a84c] hover:underline">
                empresa.v3app@gmail.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Cookies</h2>
            <p>
              Utilizamos apenas cookies essenciais para manter sua sessão autenticada.
              Não utilizamos cookies de rastreamento ou publicidade.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Alterações nesta política</h2>
            <p>
              Podemos atualizar esta política periodicamente. Quando houver mudanças relevantes,
              notificaremos por e-mail ou aviso na plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Contato</h2>
            <p>
              Dúvidas sobre privacidade:{' '}
              <a href="mailto:empresa.v3app@gmail.com" className="text-[#c9a84c] hover:underline">
                empresa.v3app@gmail.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-[#1a1a1a] flex gap-6 text-sm">
          <Link href="/termos" className="text-[#c9a84c] hover:underline">Termos de Uso</Link>
          <Link href="/" className="text-gray-400 hover:text-white">← Voltar ao início</Link>
        </div>
      </main>
    </div>
  )
}
