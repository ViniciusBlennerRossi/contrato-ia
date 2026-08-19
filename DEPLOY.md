# Deploy na VPS (Oracle Cloud + Traefik do Coolify)

## O ambiente

| item | valor |
|---|---|
| Host | `163.176.248.144` — Ubuntu 24.04, **aarch64**, 4 vCPU, 23 GB RAM |
| Proxy | `coolify-proxy` (Traefik v3.6) — entrypoints `http`/`https`, certresolver `letsencrypt` |
| Rede docker | `coolify` — subnet `10.0.2.0/24`, gateway `10.0.2.1` |
| Domínio | `contrato.v3app.com.br` → já resolve para a VPS |
| Banco | Supabase (projeto `vqyiqosjxluoggvxtzuh`) |
| LLM | Groq (nuvem). Ollama com `gemma4:e2b` existe no host, hoje sem uso |

O usuário `ubuntu` **não** está no grupo `docker`: todo comando docker exige `sudo`.

## Layout na VPS

```
/home/ubuntu/apps/contratoia/
├── repo/                 # git clone do projeto
├── .env                  # segredos (chmod 600, fora do repositório)
└── docker-compose.yml    # build context ./repo
```

O app **não** é gerenciado pelo painel do Coolify — sobe como container próprio,
e o Traefik do Coolify o roteia pelas labels. Para colocá-lo sob o painel depois,
crie a aplicação no Coolify (New Resource → Public Repository, build pack
Dockerfile, porta 3000, domínio `contrato.v3app.com.br`) e derrube este container.

## Subir / atualizar

```bash
cd /home/ubuntu/apps/contratoia
git -C repo pull
sudo docker compose up -d --build
sudo docker compose logs -f app
```

## Variáveis

Ficam em `/home/ubuntu/apps/contratoia/.env`. Veja `.env.example` para a lista.
Duas armadilhas:

- `NEXT_PUBLIC_APP_URL` é build arg (embutida no bundle). Mudou o domínio?
  Precisa **rebuild**, não basta reiniciar.
- `GMAIL_USER` / `GMAIL_APP_PASSWORD` ainda estão só na Vercel. Sem elas o
  "esqueci minha senha" não envia e-mail.

## Depois de trocar de domínio (contratoia. → contrato.)

- **Google Cloud Console** → OAuth Client → Authorized redirect URIs:
  `https://contrato.v3app.com.br/api/auth/google/callback`
- **Stripe** → Webhooks: `https://contrato.v3app.com.br/api/pagamento/webhook`

## Trocar a LLM

Sem rebuild — basta editar o `.env` e `sudo docker compose up -d`:

```env
# Gemma na própria VPS (Ollama no host)
AI_PROVIDER="local"
LOCAL_LLM_API="ollama"
LOCAL_LLM_URL="http://10.0.2.1:11434"
LOCAL_LLM_MODEL="gemma4-e2b-fast:latest"
LOCAL_LLM_TIMEOUT_MS="600000"
AI_FALLBACK_GROQ="true"
```

Antes disso o Ollama precisa aceitar conexão dos containers — hoje escuta só em
`127.0.0.1`:

```bash
sudo systemctl edit ollama     # [Service] / Environment="OLLAMA_HOST=0.0.0.0:11434"
sudo systemctl daemon-reload && sudo systemctl restart ollama
sudo iptables -I INPUT -s 10.0.2.0/24 -p tcp --dport 11434 -j ACCEPT
sudo netfilter-persistent save
```

Medido na máquina: **~14 tokens/s**, ou **3 a 4 min por contrato**, com
`OLLAMA_NUM_PARALLEL=1` (um de cada vez). O gemma4 tem *thinking*: sem
`think:false` devolve contrato vazio — [lib/llm.ts](lib/llm.ts) já cuida disso.

Para a API da OpenAI, o mesmo cliente serve: `LOCAL_LLM_API="openai"`,
`LOCAL_LLM_URL="https://api.openai.com/v1"` e a chave em `LOCAL_LLM_API_KEY`
(modelos novos exigem `max_completion_tokens` — ajuste necessário em lib/llm.ts).

## Migrar o banco do Supabase para a VPS (opcional)

```bash
pg_dump "$DIRECT_URL" --no-owner --no-privileges -Fc -f contratoia.dump
pg_restore -d "postgresql://contratoia:SENHA@localhost:5432/contratoia" --no-owner contratoia.dump
```
