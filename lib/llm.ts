import 'server-only'

/**
 * Cliente de geração de contratos.
 *
 * AI_PROVIDER=local -> LLM própria na VPS (gemma4:e2b via Ollama).
 * AI_PROVIDER=groq  -> Groq na nuvem.
 *
 * LOCAL_LLM_API=ollama usa /api/chat, única rota que aceita think:false —
 * sem isso o gemma4 gasta a cota de tokens raciocinando e devolve texto vazio.
 * LOCAL_LLM_API=openai usa /v1/chat/completions (llama.cpp, vLLM, LM Studio).
 * O padrão tenta Ollama primeiro e cai para OpenAI se a rota não existir.
 */

const TIMEOUT_MS = Number(process.env.LOCAL_LLM_TIMEOUT_MS ?? 600_000)
const MAX_TOKENS = Number(process.env.LOCAL_LLM_MAX_TOKENS ?? 4096)
const NUM_CTX = Number(process.env.LOCAL_LLM_NUM_CTX ?? 8192)
const TEMPERATURE = 0.3

class LLMError extends Error {}

/** Aceita tanto a base (http://host:11434) quanto a URL completa do endpoint. */
function resolverEndpoints(url: string) {
  const base = url.replace(/\/+$/, '')

  if (base.endsWith('/chat/completions')) {
    const raiz = base.replace(/\/v1\/chat\/completions$/, '').replace(/\/chat\/completions$/, '')
    return { openai: base, ollama: `${raiz}/api/chat` }
  }
  if (base.endsWith('/v1')) {
    return { openai: `${base}/chat/completions`, ollama: `${base.slice(0, -3)}/api/chat` }
  }
  return { openai: `${base}/v1/chat/completions`, ollama: `${base}/api/chat` }
}

/** Rede de segurança: se algum raciocínio escapar, não vai para dentro do contrato. */
function limparRaciocinio(texto: string): string {
  return texto
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
    .trim()
}

async function postJson(url: string, corpo: unknown, apiKey?: string) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    return await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify(corpo),
      signal: controller.signal,
    })
  } catch (erro) {
    if (erro instanceof Error && erro.name === 'AbortError') {
      throw new LLMError(`A LLM local não respondeu em ${TIMEOUT_MS / 1000}s`)
    }
    throw new LLMError(
      `Não foi possível falar com a LLM local (${url}): ${erro instanceof Error ? erro.message : erro}`
    )
  } finally {
    clearTimeout(timer)
  }
}

async function chamarOllama(url: string, modelo: string, prompt: string, apiKey?: string) {
  return postJson(
    url,
    {
      model: modelo,
      messages: [{ role: 'user', content: prompt }],
      stream: false,
      think: false,
      options: { temperature: TEMPERATURE, num_predict: MAX_TOKENS, num_ctx: NUM_CTX },
    },
    apiKey
  )
}

async function chamarOpenAI(url: string, modelo: string, prompt: string, apiKey?: string) {
  return postJson(
    url,
    {
      model: modelo,
      messages: [{ role: 'user', content: prompt }],
      temperature: TEMPERATURE,
      max_tokens: MAX_TOKENS,
      stream: false,
    },
    apiKey
  )
}

async function gerarLocal(prompt: string): Promise<string> {
  const url = process.env.LOCAL_LLM_URL
  const modelo = process.env.LOCAL_LLM_MODEL
  const apiKey = process.env.LOCAL_LLM_API_KEY
  const api = process.env.LOCAL_LLM_API ?? 'auto'

  if (!url) throw new LLMError('LOCAL_LLM_URL não configurada')
  if (!modelo) throw new LLMError('LOCAL_LLM_MODEL não configurada')

  const { openai, ollama } = resolverEndpoints(url)

  if (api !== 'openai') {
    const resposta = await chamarOllama(ollama, modelo, prompt, apiKey)

    if (resposta.ok) {
      const dados = await resposta.json()
      const texto = limparRaciocinio(dados?.message?.content ?? '')
      if (texto) return texto
      throw new LLMError(
        dados?.done_reason === 'length'
          ? 'O modelo esgotou os tokens antes de escrever o contrato (aumente LOCAL_LLM_MAX_TOKENS)'
          : 'Resposta vazia da LLM local'
      )
    }

    if (api === 'ollama' || resposta.status !== 404) {
      const detalhe = await resposta.text().catch(() => '')
      throw new LLMError(`LLM local respondeu ${resposta.status}: ${detalhe.slice(0, 300)}`)
    }
  }

  const resposta = await chamarOpenAI(openai, modelo, prompt, apiKey)

  if (resposta.ok) {
    const dados = await resposta.json()
    const texto = limparRaciocinio(dados?.choices?.[0]?.message?.content ?? '')
    if (texto) return texto
    throw new LLMError('Resposta vazia da LLM local')
  }

  const detalhe = await resposta.text().catch(() => '')
  throw new LLMError(`LLM local respondeu ${resposta.status}: ${detalhe.slice(0, 300)}`)
}

async function gerarGroq(prompt: string): Promise<string> {
  const { default: Groq } = await import('groq-sdk')
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

  const completion = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: TEMPERATURE,
    max_tokens: MAX_TOKENS,
  })

  const texto = completion.choices[0]?.message?.content
  if (!texto) throw new LLMError('Resposta vazia do Groq')
  return limparRaciocinio(texto)
}

export async function generateContract(prompt: string): Promise<string> {
  const provider = process.env.AI_PROVIDER ?? 'groq'

  if (provider !== 'local') return gerarGroq(prompt)

  try {
    return await gerarLocal(prompt)
  } catch (erro) {
    // Rede de segurança durante a migração: se a LLM local falhar e
    // AI_FALLBACK_GROQ=true, o contrato ainda sai pelo Groq.
    if (process.env.AI_FALLBACK_GROQ === 'true' && process.env.GROQ_API_KEY) {
      console.error('LLM local falhou, usando Groq como fallback:', erro)
      return gerarGroq(prompt)
    }
    throw erro
  }
}
