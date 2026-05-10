# Deploy no Vercel — guia rápido

Este guia te leva de "código local" a "https://otto-aerodig.vercel.app no PWA" em ~10 minutos.

> **Modo preview (sem backend):** o frontend tem `STATIC_MODE` automático — se você não configurar `VITE_API_URL`, ele lê os seeds direto de `/data/*.json` (que o Vite já empacota a partir de `aerodig-frontend/public/data/`). Tudo funciona: Atlas, Pathways, Instrumentos, Calculadoras (incluindo conversor de cânulas), Procedimentos, Fronteira, Rede, News, Eventos, Busca. Você só perde o cron do PubMed e a curadoria editorial — que são da fase backend.

---

## Passo 1 — Subir para o GitHub (PowerShell Windows)

Abre o PowerShell na pasta do projeto:

```powershell
cd "C:\Users\drdhs\OneDrive\Documentos\AOTTO ECOSYSTEM\OTTO AERODIG"
.\scripts\git-init.ps1
git push -u origin main
```

Se der erro de "remote already exists" ou "non-fast-forward", rode:

```powershell
git remote set-url origin https://github.com/dhsig86/OTTO-AERODIG.git
git push -u origin main --force
```

(O `--force` aqui é seguro porque o repo está vazio.)

---

## Passo 2 — Criar projeto no Vercel

1. Vá em https://vercel.com/new
2. **Import Git Repository** → escolha `dhsig86/OTTO-AERODIG`.
3. Na tela de configuração:
   - **Project Name:** `otto-aerodig`
   - **Framework Preset:** `Vite`
   - **Root Directory:** clique em "Edit" e selecione `aerodig-frontend`
   - **Build Command:** deixe o padrão (`npm run build`)
   - **Output Directory:** deixe o padrão (`dist`)
   - **Install Command:** deixe o padrão (`npm install`)
4. **Environment Variables:** *deixe em branco por enquanto* (o frontend cai em modo preview automático).
5. Clique em **Deploy**.

Em ~2 minutos você terá `https://otto-aerodig.vercel.app` (ou similar — o Vercel pode atribuir `otto-aerodig-<hash>.vercel.app` se o slug estiver tomado; nesse caso, configure abaixo).

---

## Passo 3 — Garantir o subdomínio `otto-aerodig.vercel.app`

Se o Vercel atribuiu um slug diferente (ex: `otto-aerodig-dario.vercel.app`), você tem 2 opções:

### Opção A — Renomear o projeto Vercel
1. No projeto Vercel → **Settings → General → Project Name** → edite para `otto-aerodig`.
2. Em **Settings → Domains**, confirme que `otto-aerodig.vercel.app` está atribuído.

### Opção B — Atualizar o tile do PWA
Se preferir manter o slug atribuído, edite `OTTO PWA/otto-pwa/src/config/modules.ts` na entrada `aerodig` e troque a `url` pela URL real do Vercel.

> **Nunca faça custom CNAME por enquanto** — você quer manter `*.vercel.app` para passar nas redes hospitalares.

---

## Passo 4 — Conectar ao OTTO PWA

O tile do AERODIG já foi adicionado ao `OTTO PWA/otto-pwa/src/config/modules.ts`:

```typescript
{
  id: 'aerodig',
  name: 'Aerodigestive',
  description: 'Hub de via aérea pediátrica',
  icon: Stethoscope,
  url: 'https://otto-aerodig.vercel.app/',
  external: true,
  profiles: ['medico', 'estudante', 'profissional'],
  premium: false,
  status: 'beta',
  category: 'clinico',
  tags: [...],
  iconBg: 'bg-[#EFF6FB] text-[#0E7AB8]'
}
```

Para o PWA exibir o tile, você precisa fazer push do PWA também:

```powershell
cd "C:\Users\drdhs\OneDrive\Documentos\AOTTO ECOSYSTEM\OTTO PWA\otto-pwa"
git status
git add src/config/modules.ts
git commit -m "feat(pwa): adiciona tile Aerodigestive Hub no dashboard clínico"
git push origin main
```

A Vercel rebuilda o PWA automaticamente em ~1 min.

---

## Passo 5 — Validar headers iframe

O `aerodig-frontend/vercel.json` já contém os headers que permitem o embed:

```json
"Content-Security-Policy": "frame-ancestors 'self' https://otto.drdariohart.com https://ottopwa.vercel.app https://otto-aerodig.vercel.app"
```

Se você usar um domínio Vercel diferente para o PWA, adicione-o aqui antes de fazer push. Senão o iframe vai aparecer em branco no PWA com mensagem "refused to connect".

---

## Passo 6 — Testar

1. Abra `https://ottopwa.vercel.app/` (ou o domínio do seu PWA).
2. Login.
3. No dashboard, procure o tile **"Aerodigestive"** (ícone estetoscópio azul).
4. Clique. O hub deve abrir embarcado em iframe, com o badge "modo preview · v0.1" no canto superior direito da home do hub.

Teste rápido no hub:
- **Atlas** → 9 condições aparecem (laringomalácia, fenda laríngea, …).
- **Calculadoras** → clique em "Conversor de cânulas de traqueostomia" → escolha "Shiley" → "4.0 PED" → confira que aparece DI 4.0 mm, DE 5.9 mm, French 18 e equivalentes em Bivona/Tracoe/Jackson.
- **Buscar** → digite "estridor" → deve achar laringomalácia, fenda, pathway.

---

## Passo 7 (opcional, depois) — Conectar backend Render

Quando você estiver pronto pra ligar o cron de news e o pipeline de eventos:

1. Crie conta no Render → **New → Blueprint** → aponte para o mesmo repo.
2. O Render lerá o `render.yaml` em `aerodig-backend/render.yaml` e criará 2 serviços:
   - `otto-aerodig-api` (web service)
   - `otto-aerodig-pubmed-daily` (cron)
3. Configure as variáveis (em **Environment** de cada serviço):
   - `FIREBASE_SERVICE_ACCOUNT_JSON` (string única do JSON da service account)
   - `DEEPSEEK_API_KEY` ou `GROQ_API_KEY`
   - `PUBMED_API_KEY` (opcional)
   - `NEWS_CRON_SECRET` (token aleatório, mesmo nos 2 serviços)
   - `FRONTEND_URL=https://otto-aerodig.vercel.app`
4. Após o deploy do backend, copie a URL pública do Render (ex: `https://otto-aerodig-api.onrender.com`).
5. Volte ao Vercel → **Settings → Environment Variables** do `otto-aerodig`:
   - Adicione `VITE_API_URL=https://otto-aerodig-api.onrender.com`
6. Trigger redeploy do frontend (Deployments → ⋯ → Redeploy).

A partir desse momento o frontend troca automaticamente do modo estático para o backend (o badge "modo preview" some).

---

## Troubleshooting

| Sintoma | Causa | Solução |
|---|---|---|
| Iframe em branco no PWA | CSP `frame-ancestors` bloqueando | Edite `aerodig-frontend/vercel.json` adicionando o domínio do PWA |
| 404 em `/atlas/laringomalacia` | Vercel não tratando SPA fallback | Conferir `vercel.json` tem `rewrites` para `/index.html` (já está) |
| Tile não aparece no PWA | Profile do usuário não corresponde | Conferir que está logado como `medico` / `estudante` / `profissional` |
| Build do Vercel falha | Type-check ou lint | Rodar local: `cd aerodig-frontend && npm install && npm run typecheck && npm run build` |

---

## Vantagens do modo preview

- **Sem custo de backend** — Vercel free tier é suficiente.
- **Funciona em hospitais** — Vercel não é bloqueado nas redes hospitalares (Wix sim).
- **Rápido** — bundle SPA + JSONs estáticos = TTFB <300ms.
- **Reproduzível** — qualquer dev abre o PR, Vercel cria preview deploy automaticamente.

Quando você quiser apresentar pra UNICAMP/HCPA, o modo preview já cobre 100% do conteúdo navegável. O backend só fica indispensável quando você ligar o cron diário de news.
