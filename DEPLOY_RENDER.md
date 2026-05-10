# Deploy do Backend AERODIG no Render.com
> Guia passo-a-passo · Maio 2026

O backend usa **Blueprint deploy** via `render.yaml` já presente no repo.
Isso significa que o Render lê o arquivo e cria tudo automaticamente — sem configurar serviços manualmente no painel.

---

## Pré-requisitos

- [ ] Repo `OTTO AERODIG` (ou apenas `aerodig-backend`) com acesso no GitHub
- [ ] Conta no [render.com](https://render.com) — plano free é suficiente para começar
- [ ] Firebase Admin service account JSON exportado (ver seção 3)
- [ ] Optionalmente: `DEEPSEEK_API_KEY` ou `GROQ_API_KEY` para resumos de news

---

## 1. Preparar o Repositório

O `render.yaml` aponta `rootDir: aerodig-backend`. Se o repo no GitHub contém
o projeto inteiro (`aerodig-frontend` + `aerodig-backend`), não precisa de nada.

Verifique que o `.gitignore` **não** exclui a pasta `seeds/`:

```bash
# No terminal, na raiz do projeto:
git -C "OTTO AERODIG" check-ignore -v aerodig-backend/seeds/calculators.json
# Deve retornar vazio (não ignorado)
```

Se a pasta `seeds/` estiver no `.gitignore`, remova a regra — o Render precisa
desses arquivos para o modo `USE_LOCAL_SEEDS=true`.

---

## 2. Deploy via Blueprint (render.yaml)

### 2a. Conectar repo ao Render

1. Acesse [dashboard.render.com](https://dashboard.render.com)
2. Clique **"New +"** → **"Blueprint"**
3. Conecte sua conta GitHub se ainda não fez
4. Selecione o repositório `OTTO AERODIG` (ou o repo que contém `aerodig-backend/`)
5. O Render detecta o `render.yaml` automaticamente
6. Clique **"Apply"**

O Render vai criar dois serviços:
- **`otto-aerodig-api`** — web service (FastAPI)
- **`otto-aerodig-pubmed-daily`** — cron job (roda 06:00 BRT)

### 2b. O que o render.yaml já configura

```yaml
# Já está definido em aerodig-backend/render.yaml:
startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
healthCheckPath: /health
```

Não precisa alterar nada no `render.yaml` para o deploy funcionar.

---

## 3. Configurar Variáveis de Ambiente

Após o Blueprint criar os serviços, acesse cada um e configure as variáveis em:
**Dashboard → otto-aerodig-api → Environment**

### Variáveis obrigatórias

| Variável | Valor | Como obter |
|----------|-------|-----------|
| `FRONTEND_URL` | `https://otto-aerodig.vercel.app` | URL do seu deploy no Vercel |
| `USE_LOCAL_SEEDS` | `true` | Mantém leitura dos JSONs locais (sem Firestore) |

### Variáveis opcionais (funcionalidades extras)

| Variável | Valor | Efeito se ausente |
|----------|-------|------------------|
| `FIREBASE_SERVICE_ACCOUNT_JSON` | JSON da service account (ver abaixo) | Auth de usuários desativada; seeds locais continuam |
| `DEEPSEEK_API_KEY` | Chave da DeepSeek | Resumos PT-BR de news desativados |
| `PUBMED_API_KEY` | Chave do NCBI E-utilities | Rate limit menor no PubMed (mas funciona) |
| `NEWS_CRON_SECRET` | String aleatória segura | Endpoint `/api/jobs/pubmed-daily` fica aberto |

> **Dica:** Para gerar o `NEWS_CRON_SECRET`: `python3 -c "import secrets; print(secrets.token_hex(32))"`

### Como obter o Firebase Service Account JSON

1. [Firebase Console](https://console.firebase.google.com) → Projeto `otto-ecosystem`
2. ⚙️ Project Settings → **Service Accounts**
3. Clique **"Generate new private key"** → Baixa um `.json`
4. Abra o arquivo, copie o conteúdo **inteiro** (incluindo `{}`)
5. Cole como valor da variável `FIREBASE_SERVICE_ACCOUNT_JSON` no Render

> ⚠️ **Importante:** O valor deve ser o JSON numa única linha ou o Render aceita multi-linha no campo de texto. Nunca commite esse arquivo no repo.

---

## 4. Verificar o Deploy

Após o deploy (2-4 minutos), teste o health check:

```bash
curl https://otto-aerodig-api.onrender.com/health
# Resposta esperada:
# {"status":"ok","service":"otto-aerodig-api","version":"0.1.0","frontend_url":"https://otto-aerodig.vercel.app"}
```

Teste a API de calculadoras:
```bash
curl https://otto-aerodig-api.onrender.com/api/calculators | python3 -m json.tool | head -20
```

Documentação interativa (Swagger):
```
https://otto-aerodig-api.onrender.com/docs
```

---

## 5. Conectar o Frontend (Vercel) ao Backend

### 5a. Variável de ambiente no Vercel

No projeto `otto-aerodig` no Vercel:
1. Settings → Environment Variables
2. Adicione: `VITE_API_URL` = `https://otto-aerodig-api.onrender.com`
3. Escopo: **Production** (e Preview se quiser)
4. Trigger um novo deploy (ou aguarde o próximo push)

### 5b. Verificar no frontend

O frontend já tem lógica de `isStaticMode`:
```typescript
// services/api.ts — já implementado
const isStaticMode = !import.meta.env.VITE_API_URL;
// Se VITE_API_URL estiver definida → chama o Render
// Se não estiver → lê os JSON locais de public/data/
```

Após configurar, a página de Calculadoras vai buscar de:
`https://otto-aerodig-api.onrender.com/api/calculators`

---

## 6. Notas sobre o Plano Free do Render

### Cold start
O plano free "hiberna" o serviço após 15 min sem tráfego. A primeira requisição
após hibernate demora **30-60 segundos**. Estratégias para mitigar:

**Opção A — Aceitar o cold start** (recomendado para preview)
O frontend pode mostrar um spinner e mensagem "Carregando serviço..." enquanto espera.

**Opção B — Ping periódico gratuito** (mantém acordado)
Use o [cron-job.org](https://cron-job.org) (gratuito) para pingar `/health`
a cada 14 minutos:
```
URL: https://otto-aerodig-api.onrender.com/health
Interval: every 14 minutes
```

**Opção C — Upgrade para Render Starter** ($7/mês)
Sem hibernate, custom domain, mais recursos. Vale quando tiver usuários regulares.

### Limites do plano free
- 750h de runtime/mês por serviço (suficiente para 1 serviço 24/7)
- 512 MB RAM
- Shared CPU
- Banco de dados PostgreSQL free: 90 dias (não usamos ainda)

---

## 7. URL Final e CORS

Após o deploy, o Render atribui uma URL permanente no formato:
```
https://otto-aerodig-api.onrender.com
```

Se quiser custom domain (`api.aerodig.drdariohart.com`):
- Render Dashboard → otto-aerodig-api → Settings → Custom Domains
- Adicione o domínio e configure o CNAME no seu DNS

O `main.py` já inclui a URL do Vercel nos `ALLOWED_ORIGINS`. Se mudar o domínio
do frontend, adicione ao array `ALLOWED_ORIGINS` e faça redeploy.

---

## 8. Cron Job PubMed Daily

O `render.yaml` inclui um cron job separado que roda às 06:00 BRT (09:00 UTC).
Ele busca novos artigos no PubMed e atualiza as news do hub.

Para disparar manualmente (com o secret configurado):
```bash
curl -X POST https://otto-aerodig-api.onrender.com/api/jobs/pubmed-daily \
  -H "X-Cron-Secret: SEU_NEWS_CRON_SECRET"
```

---

## 9. Checklist de Deploy Completo

```
[ ] render.yaml presente e correto no repo
[ ] seeds/ não está no .gitignore
[ ] Repo conectado ao Render via Blueprint
[ ] Variáveis de ambiente configuradas no Render (mínimo: FRONTEND_URL, USE_LOCAL_SEEDS=true)
[ ] /health retorna {"status":"ok",...}
[ ] /api/calculators retorna lista de 3 calculadoras
[ ] VITE_API_URL configurada no Vercel
[ ] Frontend em produção busca dados do Render (não local)
[ ] (Opcional) cron-job.org configurado para evitar cold start
```

---

## 10. Próximos Passos após o Deploy

1. **Sync de seeds backend ↔ frontend**: sempre que editar `public/data/*.json`
   no frontend, copiar para `aerodig-backend/seeds/` e commitar.
   > Futuramente: um script `scripts/sync_seeds.py` pode automatizar isso.

2. **Firebase Auth**: quando ativar login no AERODIG, configurar
   `FIREBASE_SERVICE_ACCOUNT_JSON` e mudar `USE_LOCAL_SEEDS=false` para
   habilitar leitura/escrita no Firestore por usuário autenticado.

3. **CALC-HUB integration**: as calculadoras do AERODIG podem ser expostas
   também no OTTO CALC-HUB via `/api/calculators?domain=aerodigestive` —
   sem duplicar código.
