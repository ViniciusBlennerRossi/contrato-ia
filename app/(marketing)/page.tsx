'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const TIPOS = [
  '📄 Prestação de Serviços', '🔒 NDA', '🤝 Parceria Comercial', '🏢 Locação Comercial',
  '🛒 Compra e Venda', '📋 Contrato de Trabalho', '🔄 Permuta', '📊 Representação Comercial',
  '📱 Influencer', '💻 Desenvolvimento de Software', '🎨 Cessão de Direitos Autorais',
  '🎯 Coaching', '🏠 Locação Residencial', '📦 Comodato', '🔨 Empreitada', '⚙️ Licença de Software',
]

const CONTRATOS = [
  { emoji: '💼', nome: 'Prestação de Serviços', desc: 'Para freelancers e autônomos' },
  { emoji: '🔒', nome: 'Confidencialidade (NDA)', desc: 'Proteja suas ideias' },
  { emoji: '🤝', nome: 'Parceria Comercial', desc: 'Entre sócios e colaboradores' },
  { emoji: '🏢', nome: 'Locação Comercial', desc: 'Escritório e espaços' },
  { emoji: '🛒', nome: 'Compra e Venda', desc: 'Produtos e imóveis' },
  { emoji: '📋', nome: 'Contrato de Trabalho', desc: 'Vínculo CLT simplificado' },
  { emoji: '🔄', nome: 'Permuta', desc: 'Troca de bens e serviços' },
  { emoji: '📊', nome: 'Representação Comercial', desc: 'Representantes e distribuidores' },
  { emoji: '📱', nome: 'Influencer / Marketing Digital', desc: 'Criadores de conteúdo e marcas' },
  { emoji: '💻', nome: 'Desenvolvimento de Software', desc: 'Devs, agências e startups' },
  { emoji: '🎨', nome: 'Cessão de Direitos Autorais', desc: 'Designers, fotógrafos, escritores' },
  { emoji: '🎯', nome: 'Coaching / Mentoria', desc: 'Coaches e consultores' },
  { emoji: '🏠', nome: 'Locação Residencial', desc: 'Proprietários e inquilinos' },
  { emoji: '📦', nome: 'Comodato', desc: 'Empréstimo de bens e equipamentos' },
  { emoji: '🔨', nome: 'Empreitada / Reforma', desc: 'Pedreiros e construtores' },
  { emoji: '⚙️', nome: 'Licença de Software (SaaS)', desc: 'Empresas de software' },
]

const DEPOIMENTOS = [
  { nome: 'Rafael S.', cargo: 'Designer Freelancer', texto: 'Economizei R$600 que pagaria num advogado. Em 30 segundos tinha meu contrato de cessão de direitos. Impressionante.', estrelas: 5 },
  { nome: 'Ana L.', cargo: 'Consultora de Marketing', texto: 'Uso todo mês para meus clientes. O plano mensal se pagou no primeiro contrato. Linguagem jurídica perfeita.', estrelas: 5 },
  { nome: 'Carlos M.', cargo: 'Desenvolvedor', texto: 'Finalmente consigo me proteger em projetos sem pagar R$400 por contrato. É o que faltava para freelancers.', estrelas: 5 },
]

const FAQS = [
  {
    p: 'Os contratos gerados são válidos juridicamente?',
    r: 'Sim. Os contratos são gerados com linguagem jurídica brasileira, seguindo o Código Civil e legislações pertinentes. São prontos para assinar. Para situações complexas, recomendamos revisão de um advogado.',
  },
  {
    p: 'Posso editar o contrato depois de gerado?',
    r: 'Sim. O texto gerado pode ser copiado e editado livremente em qualquer editor de texto antes de imprimir ou assinar.',
  },
  {
    p: 'Qual a diferença entre o plano Avulso e o Mensal?',
    r: 'O Avulso é um pagamento único de R$29 para 1 contrato. O Mensal por R$47 permite gerar 10 contratos por mês, com renovação automática. Se você usa frequentemente, o Mensal vale muito mais.',
  },
  {
    p: 'Posso cancelar o plano quando quiser?',
    r: 'Sim, sem multas ou fidelidade. Cancele a qualquer momento pelo painel de assinatura. O acesso continua até o fim do período pago.',
  },
  {
    p: 'Como funciona o suporte?',
    r: 'Planos Avulso e Mensal têm suporte por email em até 48h. O plano Profissional inclui suporte prioritário via WhatsApp em horário comercial.',
  },
]

export default function LandingPage() {
  const [navScrolled, setNavScrolled] = useState(false)
  const [faqAberto, setFaqAberto] = useState<number | null>(null)

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="bg-[#080808] text-[#f8f4ef] font-[family-name:var(--font-outfit)]">

      {/* NAV */}
      <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 transition-all duration-300 ${navScrolled ? 'bg-[#080808]/95 backdrop-blur-md border-b border-[#2a2a2a]' : ''}`}>
        <div className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold tracking-wide">
          Contrato<span className="text-[#c8a84b]">IA</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {[['Como funciona', '#como-funciona'], ['Contratos', '#contratos'], ['Preços', '#precos'], ['FAQ', '#faq']].map(([label, href]) => (
            <a key={href} href={href} className="text-xs tracking-widest uppercase text-gray-400 hover:text-white transition-colors">
              {label}
            </a>
          ))}
        </div>
        <Link
          href="/cadastro"
          className="border border-[#c8a84b] text-[#c8a84b] hover:bg-[#c8a84b] hover:text-black px-5 py-2 text-xs tracking-widest uppercase transition-all duration-200"
        >
          Começar
        </Link>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-16 pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_80%_50%,#c8a84b0a,transparent),radial-gradient(ellipse_40%_60%_at_20%_80%,#c8a84b06,transparent)]" />
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(rgba(200,168,75,0.04) 1px, transparent 1px),linear-gradient(90deg,rgba(200,168,75,0.04) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

        <div className="relative max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-px bg-[#c8a84b]" />
            <span className="text-xs tracking-[3px] uppercase text-[#c8a84b]">IA Jurídica Brasileira</span>
          </div>

          <h1 className="font-[family-name:var(--font-cormorant)] text-5xl md:text-7xl lg:text-8xl font-semibold leading-tight mb-6">
            Contratos jurídicos
            <br />
            <em className="text-[#c8a84b] not-italic">em 30 segundos.</em>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
            Gere contratos profissionais com IA para MEIs, freelancers e pequenas empresas.
            A partir de <strong className="text-white">R$29</strong> — sem advogado, sem espera.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/cadastro"
              className="inline-flex items-center justify-center gap-2 bg-[#c8a84b] hover:bg-[#b8963e] text-black font-semibold px-8 py-4 text-sm tracking-wide transition-all"
            >
              ⚡ Gerar meu primeiro contrato
            </Link>
            <a
              href="#como-funciona"
              className="inline-flex items-center justify-center border border-[#2a2a2a] hover:border-[#c8a84b] text-gray-300 px-8 py-4 text-sm tracking-wide transition-all"
            >
              Como funciona →
            </a>
          </div>

          <div className="flex flex-wrap gap-6 mt-12 text-sm text-gray-500">
            {[['15M+', 'MEIs no Brasil'], ['R$800', 'custo médio de advogado'], ['30s', 'para gerar seu contrato']].map(([num, desc]) => (
              <div key={num} className="flex items-center gap-2">
                <span className="text-[#c8a84b] font-bold">{num}</span>
                <span>{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="border-y border-[#2a2a2a] py-4 overflow-hidden bg-[#111]">
        <div className="flex gap-8 animate-[marquee_25s_linear_infinite] whitespace-nowrap">
          {[...TIPOS, ...TIPOS].map((tipo, i) => (
            <span key={i} className="text-xs tracking-widest uppercase text-gray-500 flex-shrink-0">
              {tipo} <span className="text-[#c8a84b] mx-3">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* PROBLEMA */}
      <section className="px-6 md:px-16 py-24 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-8 h-px bg-[#c8a84b]" />
          <span className="text-xs tracking-[3px] uppercase text-[#c8a84b]">O Problema</span>
        </div>

        <h2 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-semibold mb-12">
          Trabalhar sem contrato é risco real.
          <br />
          <em className="text-gray-400 not-italic">Mas advogados custam caro.</em>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '💸', titulo: 'R$300 a R$800', desc: 'É o que advogados cobram por um único contrato simples. Inviável para MEIs e freelancers.' },
            { icon: '⏳', titulo: '3 a 10 dias', desc: 'O tempo médio para ter um contrato pronto. Enquanto isso, você trabalha sem proteção.' },
            { icon: '😰', titulo: 'Sem proteção', desc: 'Calotes, disputas, trabalho sem pagamento. Acontece todo dia com quem não tem contrato.' },
          ].map(({ icon, titulo, desc }) => (
            <div key={titulo} className="border border-[#2a2a2a] p-6">
              <div className="text-3xl mb-4">{icon}</div>
              <div className="text-[#c8a84b] font-semibold mb-2">{titulo}</div>
              <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* COMPARAÇÃO */}
      <section className="px-6 md:px-16 py-20 bg-[#111] border-y border-[#2a2a2a]">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-[family-name:var(--font-cormorant)] text-4xl font-semibold text-center mb-12">
            ContratoIA vs. Advogado Tradicional
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a2a2a]">
                  <th className="text-left py-3 text-gray-400 font-normal">Aspecto</th>
                  <th className="text-center py-3 text-gray-400 font-normal">Advogado</th>
                  <th className="text-center py-3 text-[#c8a84b] font-semibold">ContratoIA</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Custo', 'R$300 – R$800', 'R$29 – R$47'],
                  ['Tempo', '3 a 10 dias', '30 segundos'],
                  ['Disponibilidade', 'Horário comercial', '24h por dia'],
                  ['Revisões', 'R$150+ por revisão', 'Ilimitadas'],
                  ['Formato', 'PDF (às vezes)', 'PDF + Word'],
                  ['Prontidão', 'Agenda necessária', 'Agora mesmo'],
                ].map(([aspecto, adv, cai]) => (
                  <tr key={aspecto} className="border-b border-[#1a1a1a]">
                    <td className="py-4 text-gray-300">{aspecto}</td>
                    <td className="py-4 text-center text-gray-500">{adv}</td>
                    <td className="py-4 text-center text-[#c8a84b] font-medium">{cai}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="px-6 md:px-16 py-24 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-8 h-px bg-[#c8a84b]" />
          <span className="text-xs tracking-[3px] uppercase text-[#c8a84b]">Como Funciona</span>
        </div>

        <h2 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-semibold mb-16">
          Três passos. Trinta segundos.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { num: '01', titulo: 'Escolha o tipo', desc: '16 modelos jurídicos para todas as situações: serviços, NDA, aluguel, influencer, software e muito mais.' },
            { num: '02', titulo: 'Preencha os dados', desc: 'Nome das partes, CPF/CNPJ, valor, prazo e descrição. Formulário simples, sem termos técnicos.' },
            { num: '03', titulo: 'Baixe e assine', desc: 'Contrato gerado com linguagem jurídica brasileira. Exporte em PDF ou Word. Assine digitalmente ou em papel.' },
          ].map(({ num, titulo, desc }) => (
            <div key={num} className="relative">
              <div className="font-[family-name:var(--font-cormorant)] text-6xl font-bold text-[#c8a84b]/20 mb-4">{num}</div>
              <h3 className="text-xl font-semibold mb-3">{titulo}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TIPOS DE CONTRATO */}
      <section id="contratos" className="px-6 md:px-16 py-20 bg-[#111] border-y border-[#2a2a2a]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-8 h-px bg-[#c8a84b]" />
            <span className="text-xs tracking-[3px] uppercase text-[#c8a84b]">Modelos Disponíveis</span>
          </div>
          <h2 className="font-[family-name:var(--font-cormorant)] text-4xl font-semibold mb-12">
            16 tipos de contrato disponíveis agora.
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {CONTRATOS.map(({ emoji, nome, desc }) => (
              <div key={nome} className="border border-[#2a2a2a] p-4 hover:border-[#c8a84b]/50 transition-colors">
                <div className="text-2xl mb-2">{emoji}</div>
                <div className="font-medium text-sm mb-1">{nome}</div>
                <div className="text-xs text-gray-500">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="px-6 md:px-16 py-24 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-8 h-px bg-[#c8a84b]" />
          <span className="text-xs tracking-[3px] uppercase text-[#c8a84b]">Depoimentos</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DEPOIMENTOS.map(({ nome, cargo, texto, estrelas }) => (
            <div key={nome} className="border border-[#2a2a2a] p-6">
              <div className="text-[#c8a84b] mb-3">{'★'.repeat(estrelas)}</div>
              <p className="text-sm text-gray-300 leading-relaxed mb-4">"{texto}"</p>
              <div>
                <div className="font-semibold text-sm">{nome}</div>
                <div className="text-xs text-gray-500">{cargo}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PREÇOS */}
      <section id="precos" className="px-6 md:px-16 py-24 bg-[#111] border-y border-[#2a2a2a]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-px bg-[#c8a84b]" />
              <span className="text-xs tracking-[3px] uppercase text-[#c8a84b]">Preços</span>
              <div className="w-8 h-px bg-[#c8a84b]" />
            </div>
            <h2 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-semibold">
              Investimento que se paga no primeiro contrato.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { nome: 'Avulso', preco: 29, periodo: 'contrato', desc: 'Para quem precisa agora', recursos: ['1 contrato por IA', 'Export PDF + Word', 'Histórico 30 dias', 'Suporte por email'], destaque: false },
              { nome: 'Mensal', preco: 47, periodo: 'mês', desc: '10 contratos por mês', recursos: ['10 contratos/mês', 'Export PDF + Word', 'Histórico completo', 'Suporte por email'], destaque: true },
              { nome: 'Profissional', preco: 197, periodo: 'mês', desc: 'Para uso intenso', recursos: ['Contratos ilimitados', 'Export PDF + Word', 'Histórico ilimitado', 'Suporte WhatsApp', 'Logotipo personalizado'], destaque: false },
            ].map(({ nome, preco, periodo, desc, recursos, destaque }) => (
              <div key={nome} className={`relative border p-6 flex flex-col ${destaque ? 'border-[#c8a84b]' : 'border-[#2a2a2a]'}`}>
                {destaque && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#c8a84b] text-black text-xs font-bold px-3 py-1">
                    MAIS POPULAR
                  </div>
                )}
                <h3 className="font-semibold text-lg mb-1">{nome}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold text-[#c8a84b]">R${preco}</span>
                  <span className="text-sm text-gray-400">/{periodo}</span>
                </div>
                <p className="text-xs text-gray-500 mb-5">{desc}</p>
                <ul className="space-y-2 flex-1 mb-6">
                  {recursos.map((r) => (
                    <li key={r} className="text-sm text-gray-300 flex items-center gap-2">
                      <span className="text-[#c8a84b]">✓</span> {r}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/cadastro"
                  className={`text-center py-3 text-sm font-semibold tracking-wide transition-all ${destaque ? 'bg-[#c8a84b] hover:bg-[#b8963e] text-black' : 'border border-[#c8a84b] text-[#c8a84b] hover:bg-[#c8a84b] hover:text-black'}`}
                >
                  Começar agora
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-500 mt-6">
            💳 PIX, cartão de crédito (até 12x) e boleto · Sem fidelidade · Cancele quando quiser
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-6 md:px-16 py-24 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-8 h-px bg-[#c8a84b]" />
          <span className="text-xs tracking-[3px] uppercase text-[#c8a84b]">Perguntas Frequentes</span>
        </div>
        <div className="space-y-2">
          {FAQS.map(({ p, r }, i) => (
            <div key={i} className="border border-[#2a2a2a]">
              <button
                onClick={() => setFaqAberto(faqAberto === i ? null : i)}
                className="w-full text-left px-5 py-4 flex items-center justify-between text-sm font-medium"
              >
                {p}
                <span className={`text-[#c8a84b] transition-transform ${faqAberto === i ? 'rotate-45' : ''}`}>+</span>
              </button>
              {faqAberto === i && (
                <div className="px-5 pb-4 text-sm text-gray-400 leading-relaxed border-t border-[#1a1a1a]">
                  {r}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="px-6 md:px-16 py-24 text-center bg-[#111] border-t border-[#2a2a2a]">
        <h2 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-6xl font-semibold mb-4">
          Proteja seu trabalho.
          <br />
          <em className="text-[#c8a84b] not-italic">Agora. Por R$29.</em>
        </h2>
        <p className="text-gray-400 mb-8 max-w-xl mx-auto">
          Junte-se a freelancers, MEIs e pequenas empresas que já geram contratos profissionais com IA.
        </p>
        <Link
          href="/cadastro"
          className="inline-flex items-center gap-2 bg-[#c8a84b] hover:bg-[#b8963e] text-black font-semibold px-10 py-4 text-sm tracking-wide transition-all"
        >
          ⚡ Criar conta gratuita — começar agora
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="px-6 md:px-16 py-8 border-t border-[#2a2a2a] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="font-[family-name:var(--font-cormorant)] text-xl font-semibold">
          Contrato<span className="text-[#c8a84b]">IA</span>
        </div>
        <p className="text-xs text-gray-600">© {new Date().getFullYear()} ContratoIA. Todos os direitos reservados.</p>
        <div className="flex gap-4 text-xs text-gray-500">
          <Link href="/termos" className="hover:text-white transition-colors">Termos</Link>
          <Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
        </div>
      </footer>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0) }
          to { transform: translateX(-50%) }
        }
      `}</style>
    </div>
  )
}
