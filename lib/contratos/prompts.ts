export type FormData = {
  contratante: string
  cpfCnpjContratante: string
  contratado: string
  cpfCnpjContratado: string
  valor: string
  duracao: string
  descricao: string
  cidade: string
  estado: string
  formaPagamento: string
  tipoContrato: string
}

function cabecalhoBase(dados: FormData, nomeContrato: string): string {
  const dataAtual = new Date().toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return `
Você é um especialista jurídico brasileiro. Gere um contrato completo de ${nomeContrato} em português do Brasil.

DADOS DO CONTRATO:
- Contratante: ${dados.contratante} (CPF/CNPJ: ${dados.cpfCnpjContratante})
- Contratado: ${dados.contratado} (CPF/CNPJ: ${dados.cpfCnpjContratado})
- Valor: R$ ${dados.valor}
- Duração/Prazo: ${dados.duracao}
- Forma de Pagamento: ${dados.formaPagamento}
- Cidade/Estado: ${dados.cidade}/${dados.estado}
- Data: ${dataAtual}
- Descrição/Objeto: ${dados.descricao}

INSTRUÇÕES OBRIGATÓRIAS:
- Use linguagem jurídica formal brasileira
- Inclua: qualificação das partes, cláusulas numeradas, objeto, obrigações, valor e pagamento, prazo, rescisão, penalidades, foro
- Formate com cabeçalho, cláusulas e espaço para assinatura
- O contrato deve ser pronto para uso real
- Não inclua explicações externas ao texto do contrato
- Finalize com espaço para assinaturas das partes e 2 testemunhas
- NÃO use marcação Markdown: nada de asteriscos (**), cerquilhas (#) ou linhas de traços (---)
- Títulos e nomes de cláusula em MAIÚSCULAS, como em contrato impresso
- Texto puro, pronto para imprimir e assinar

GERE APENAS O TEXTO DO CONTRATO:
`
}

export function buildPrompt(dados: FormData): string {
  const prompts: Record<string, () => string> = {
    'prestacao-servicos': () =>
      cabecalhoBase(dados, 'Prestação de Serviços') +
      'Inclua cláusulas específicas sobre: escopo dos serviços, metodologia de entrega, propriedade intelectual dos resultados, sigilo, e vedação de subcontratação sem autorização.',

    'confidencialidade': () =>
      cabecalhoBase(dados, 'Confidencialidade (NDA)') +
      'Inclua: definição de informações confidenciais, obrigações de sigilo, exceções à confidencialidade, prazo de vigência do sigilo após término, penalidades por violação.',

    'parceria-comercial': () =>
      cabecalhoBase(dados, 'Parceria Comercial') +
      'Inclua: objeto da parceria, responsabilidades de cada parte, divisão de receitas/despesas, gestão e tomada de decisões, saída de sócios, dissolução.',

    'locacao-comercial': () =>
      cabecalhoBase(dados, 'Locação Comercial') +
      'Inclua: descrição do imóvel, destinação exclusivamente comercial, reajuste anual (IGPM), IPTU e condomínio, vistoria de entrada/saída, reformas e benfeitorias.',

    'compra-venda': () =>
      cabecalhoBase(dados, 'Compra e Venda') +
      'Inclua: descrição detalhada do bem/produto, condições de entrega, garantias, vícios ocultos, transferência de titularidade, condições suspensivas.',

    'contrato-trabalho': () =>
      cabecalhoBase(dados, 'Contrato de Trabalho') +
      'Inclua: cargo e função, jornada de trabalho, remuneração e benefícios, período de experiência, subordinação e exclusividade, FGTS e encargos trabalhistas.',

    'permuta': () =>
      cabecalhoBase(dados, 'Permuta') +
      'Inclua: descrição detalhada de cada bem/serviço permutado, avaliação de cada parte, diferença de valores se houver, responsabilidades por vícios, entrega.',

    'representacao-comercial': () =>
      cabecalhoBase(dados, 'Representação Comercial') +
      'Inclua: território de atuação, produtos/serviços a representar, comissão e forma de cálculo, exclusividade territorial, obrigações do representante, CORE.',

    'influencer-marketing': () =>
      cabecalhoBase(dados, 'Parceria de Marketing Digital / Influencer') +
      'Inclua: escopo das publicações (número de posts, stories, reels), plataformas, direitos de imagem e voz, aprovação de conteúdo, vedação de concorrentes, métricas e relatórios.',

    'desenvolvimento-software': () =>
      cabecalhoBase(dados, 'Desenvolvimento de Software') +
      'Inclua: escopo técnico do projeto, metodologia (ágil/waterfall), entregas e milestones, propriedade intelectual do código, manutenção pós-entrega, sigilo do código-fonte, suporte.',

    'cessao-direitos-autorais': () =>
      cabecalhoBase(dados, 'Cessão de Direitos Autorais') +
      'Inclua: descrição da obra (título, tipo, características), direitos cedidos (reprodução, distribuição, adaptação), exclusividade, territorialidade, prazo, atribuição de autoria.',

    'coaching-mentoria': () =>
      cabecalhoBase(dados, 'Coaching e Mentoria') +
      'Inclua: número e frequência de sessões, modalidade (presencial/online), metodologia, comprometimento do mentorado, sigilo do conteúdo das sessões, cancelamentos, resultados esperados.',

    'locacao-residencial': () =>
      cabecalhoBase(dados, 'Locação Residencial') +
      'Inclua: descrição do imóvel (endereço, metragem, características), destinação exclusivamente residencial, vistoria, garantia locatícia (fiador/caução), reajuste anual (IPCA), sublocação proibida.',

    'comodato': () =>
      cabecalhoBase(dados, 'Comodato') +
      'Inclua: descrição detalhada do bem (marca, modelo, número de série), finalidade do empréstimo, gratuidade, responsabilidade por conservação e manutenção, seguro, devolução.',

    'empreitada-reforma': () =>
      cabecalhoBase(dados, 'Empreitada / Reforma') +
      'Inclua: descrição detalhada da obra/reforma, local de execução, materiais (quem fornece), prazo de execução, cronograma físico-financeiro, medições, retenção de garantia, responsabilidade técnica.',

    'licenca-software': () =>
      cabecalhoBase(dados, 'Licença de Software (SaaS)') +
      'Inclua: descrição do software/serviço, tipo de licença (por usuário/empresa), SLA e disponibilidade, privacidade e LGPD, suporte técnico, atualizações, vedação de engenharia reversa, suspensão por inadimplência.',
  }

  const buildFn = prompts[dados.tipoContrato]
  if (!buildFn) return cabecalhoBase(dados, 'Prestação de Serviços')
  return buildFn()
}
