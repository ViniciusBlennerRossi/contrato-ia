/**
 * Abre o contrato numa janela pronta para imprimir ou salvar em PDF.
 *
 * O texto entra por textContent, nunca por document.write com interpolação: o
 * conteúdo carrega nomes digitados pelo usuário, e montar HTML com eles
 * significava executar o que fosse escrito nos campos do formulário.
 *
 * Também trata a janela bloqueada — o código anterior usava `window.open(...)!`
 * e estourava em silêncio quando o navegador barrava o pop-up.
 */
const ESTILO_IMPRESSAO = `
  @page { margin: 2.5cm 2cm; }
  body {
    font-family: Georgia, 'Times New Roman', serif;
    max-width: 800px;
    margin: 40px auto;
    padding: 0 20px;
    line-height: 1.8;
    font-size: 14px;
    color: #111;
  }
  pre {
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: inherit;
    margin: 0;
  }
`

export function imprimirContrato(titulo: string, conteudo: string): boolean {
  const janela = window.open('', '_blank')
  if (!janela) return false

  const doc = janela.document
  doc.open()
  doc.close()

  doc.title = titulo

  const estilo = doc.createElement('style')
  estilo.textContent = ESTILO_IMPRESSAO
  doc.head.appendChild(estilo)

  const bloco = doc.createElement('pre')
  bloco.textContent = conteudo
  doc.body.appendChild(bloco)

  janela.focus()
  janela.print()
  return true
}
