export type TipoContrato = {
  id: string
  nome: string
  emoji: string
  descricao: string
  camposEspecificos?: string[]
}

export const TIPOS_CONTRATO: TipoContrato[] = [
  {
    id: 'prestacao-servicos',
    nome: 'Prestação de Serviços',
    emoji: '💼',
    descricao: 'Para freelancers, consultores e autônomos',
  },
  {
    id: 'confidencialidade',
    nome: 'Confidencialidade (NDA)',
    emoji: '🔒',
    descricao: 'Proteja suas ideias e informações sensíveis',
  },
  {
    id: 'parceria-comercial',
    nome: 'Parceria Comercial',
    emoji: '🤝',
    descricao: 'Entre empresas, sócios e colaboradores estratégicos',
  },
  {
    id: 'locacao-comercial',
    nome: 'Locação Comercial',
    emoji: '🏢',
    descricao: 'Aluguel de escritório, sala ou espaço comercial',
  },
  {
    id: 'compra-venda',
    nome: 'Compra e Venda',
    emoji: '🛒',
    descricao: 'Venda de produtos, serviços ou imóveis',
  },
  {
    id: 'contrato-trabalho',
    nome: 'Contrato de Trabalho',
    emoji: '📋',
    descricao: 'Vínculo empregatício simplificado CLT',
  },
  {
    id: 'permuta',
    nome: 'Permuta',
    emoji: '🔄',
    descricao: 'Troca formal de serviços ou produtos',
  },
  {
    id: 'representacao-comercial',
    nome: 'Representação Comercial',
    emoji: '📊',
    descricao: 'Para representantes comerciais e vendedores',
  },
  {
    id: 'influencer-marketing',
    nome: 'Influencer / Marketing Digital',
    emoji: '📱',
    descricao: 'Para criadores de conteúdo e marcas',
  },
  {
    id: 'desenvolvimento-software',
    nome: 'Desenvolvimento de Software',
    emoji: '💻',
    descricao: 'Para devs, agências e startups',
  },
  {
    id: 'cessao-direitos-autorais',
    nome: 'Cessão de Direitos Autorais',
    emoji: '🎨',
    descricao: 'Para designers, fotógrafos e escritores',
  },
  {
    id: 'coaching-mentoria',
    nome: 'Coaching / Mentoria',
    emoji: '🎯',
    descricao: 'Para coaches e consultores',
  },
  {
    id: 'locacao-residencial',
    nome: 'Locação Residencial',
    emoji: '🏠',
    descricao: 'Aluguel de imóvel residencial',
  },
  {
    id: 'comodato',
    nome: 'Comodato',
    emoji: '📦',
    descricao: 'Empréstimo de bem sem cobrança de aluguel',
  },
  {
    id: 'empreitada-reforma',
    nome: 'Empreitada / Reforma',
    emoji: '🔨',
    descricao: 'Para pedreiros, construtores e reformas',
  },
  {
    id: 'licenca-software',
    nome: 'Licença de Software (SaaS)',
    emoji: '⚙️',
    descricao: 'Para empresas de software e SaaS',
  },
]

export function getTipoById(id: string): TipoContrato | undefined {
  return TIPOS_CONTRATO.find((t) => t.id === id)
}
