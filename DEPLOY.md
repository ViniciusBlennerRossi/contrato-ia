# Deploy na VPS (Oracle Cloud + Coolify)

## O ambiente

| item | valor |
|---|---|
| Host | `163.176.248.144` — Ubuntu 24.04, **aarch64**, 4 vCPU, 23 GB RAM |
| Orquestrador | Coolify 4.1.2 (proxy = `coolify-proxy`, Traefik v3.6) |
| Rede docker | `coolify` — subnet `10.0.2.0/24`, gateway **`10.0.2.1`** |
| LLM | Ollama no host (systemd), `gemma4:e2b` e `gemma4-e2b-fast:latest` |
| Banco | Supabase (projeto `vqyiqosjxluoggvxtzuh`) |

`contrato.v3app.com.br` já resolve para essa VPS. O Traefik responde
**503 "no available server"** porque ainda não existe aplicação registrada para
esse domínio — criar a app no Coolify é o que resolve.

## 1. Liberar o Ollama para os containers

O Ollama escuta só em `127.0.0.1:11434`, então nenhum container o alcança.
A máquina já usa esse mesmo padrão para o hermes na 8090.

```bash
sudo systemctl edit ollama          # cria o override
# no editor:
[Service]
Environment="OLLAMA_HOST=0.0.0.0:11434"

sudo systemctl daemon-reload && sudo systemctl restart ollama

# libera só a rede do coolify (INPUT tem policy DROP, o mundo continua fora)
sudo iptables -I INPUT -s 10.0.2.0/24 -p tcp --dport 11434 -j ACCEPT
sudo netfilter-persistent save
```

Conferir de dentro de um container:

```bash
sudo docker run --rm --network coolify curlimages/curl -s -m5 http://10.0.2.1:11434/api/tags
```

## 2. Criar a aplicação no Coolify

Painel em `http://163.176.248.144:8000` → **New Resource → Application → Public Repository**

- Repositório: `https://github.com/ViniciusBlennerRossi/contrato-ia`, branch `master`
- Build Pack: **Dockerfile**
- Domínio: `https://contrato.v3app.com.br`
- Porta exposta: `3000`

O Coolify cria a rota no Traefik e emite o certificado Let's Encrypt sozinho —
é isso que derruba o 503 e o erro de certificado.

## 3. Variáveis de ambiente

Cole no painel (aba Environment Variables) o conteúdo do `.env.example` com os
valores reais. Atenção:

- `NEXT_PUBLIC_APP_URL` precisa estar marcada como **Build Variable** — variável
  `NEXT_PUBLIC_*` é embutida no bundle durante o build, não lida em runtime.
- `GMAIL_USER` / `GMAIL_APP_PASSWORD` estão hoje só na Vercel; sem elas o
  "esqueci minha senha" quebra.
- `SESSION_SECRET` pode ser reaproveitado da Vercel (senão todas as sessões ativas caem).

## 4. Apontar para o Gemma

```env
AI_PROVIDER="local"
LOCAL_LLM_API="ollama"
LOCAL_LLM_URL="http://10.0.2.1:11434"
LOCAL_LLM_MODEL="gemma4-e2b-fast:latest"
LOCAL_LLM_TIMEOUT_MS="600000"
AI_FALLBACK_GROQ="true"
```

Medido na máquina: **~14 tokens/s**, ou seja **3 a 4 minutos por contrato**.
Dois detalhes que valem lembrar:

- O gemma4 tem *thinking*. Sem `think:false` ele gasta a cota de tokens
  raciocinando e devolve contrato vazio — [lib/llm.ts](lib/llm.ts) já manda
  `think:false` e ainda limpa `<think>` da saída por segurança.
- `OLLAMA_NUM_PARALLEL=1` no systemd: as gerações são enfileiradas, uma por vez.
  Com 3-4 min cada, dois usuários simultâneos significam ~8 min para o segundo.

## 5. Depois de subir

- Stripe: o webhook continua em `https://contrato.v3app.com.br/api/pagamento/webhook`
  (domínio não muda). Confira se os eventos chegam com 200.
- Google OAuth: mesmo domínio, nada a alterar.
- Vercel: só desative o projeto depois que a VPS estiver estável.

## Alternativa sem Coolify

O [docker-compose.yml](docker-compose.yml) na raiz faz o mesmo deploy à mão
(labels do Traefik + Postgres opcional), caso um dia a app saia do Coolify.

## Migrar o banco do Supabase para a VPS (opcional)

```bash
pg_dump "$DIRECT_URL" --no-owner --no-privileges -Fc -f contratoia.dump
pg_restore -d "postgresql://contratoia:SENHA@localhost:5432/contratoia" --no-owner contratoia.dump
```
