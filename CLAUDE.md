# OTTO Aerodigestive Hub — CLAUDE.md

> Contexto operacional para sessões de Claude/IA.

## O que é este módulo

Hub clínico-editorial brasileiro de medicina aerodigestiva pediátrica.
Mais um módulo do **OTTO Ecosystem** (junto com PWA, PROTTO, BOTTOK, Atlas, CALC-HUB, Cases, Voice, etc).

Padrão arquitetural: **clone do OTTO PROTTO** — FastAPI (Render) + React+TS+Vite+Tailwind (Vercel) + Firebase Auth/Firestore.

---

## Estrutura

```
OTTO AERODIG/
├── aerodig-backend/     FastAPI → Render — porta dev 8003
│   ├── main.py
│   ├── routers/         (conditions, pathways, instruments, procedures, frontier, network, news, events, search)
│   ├── services/        (pubmed, llm, relevance_score, content_loader)
│   ├── jobs/            (pubmed_daily — cron Render)
│   ├── models/          (Pydantic schemas)
│   ├── seeds/           (JSONs de conteúdo seed)
│   └── tests/           (pytest)
└── aerodig-frontend/    React+TS+Vite → Vercel — porta dev 5176
    ├── src/
    │   ├── App.tsx      (roteamento react-router-dom)
    │   ├── pages/       (Home, Atlas, Condition, Pathways, Instruments, Procedures, Frontier, Network, News, Events, Search)
    │   ├── components/  (Layout, Sidebar, ConfidenceBadge, ConditionCard)
    │   ├── services/    (firebase, api)
    │   ├── hooks/       (useAuth, useContent)
    │   ├── types/       (content.ts — espelha schemas Pydantic)
    │   └── tests/       (vitest + @testing-library/react)
    └── tailwind.config.js  (tokens otto-* + aerodig-*)
```

---

## Princípios editoriais (não-negociáveis)

1. **Ledger de confiança** (`high` / `moderate` / `low`) em todo verbete.
2. **Separar padrão / variante / experimental** — não misturar.
3. **Outcome sets** obrigatórios em toda página de procedimento (decanulação, reintervenção, voz, deglutição, complicações, follow-up).
4. **Organizar por decisão**, não apenas por anatomia.
5. **Dados brasileiros** sempre que existirem; sinalizar quando faltarem.
6. **Não personalizar recomendação clínica** — hub é educacional.

---

## Convenções

| Item | Valor |
|---|---|
| Design tokens Tailwind | `otto-*` (compartilhados com PWA) + `aerodig-*` (locais) |
| Idioma | PT-BR primário, EN para termos clínicos consolidados (em `<i>`) |
| Slug | kebab-case (`laringomalacia`, `fenda-laringea`, `estenose-subglotica`) |
| ID Firestore | mesmo do slug |
| Auth | Firebase Auth uid universal do ecossistema |
| Backend | só lê do Firestore; escrita por jobs ou admin curador |
| Embed PWA | iframe com CSP `frame-ancestors` (vercel.json) |
| Domínio público | `otto-aerodig.vercel.app` (CNAME custom em v1.1 — opcional) |
| Repo GitHub | https://github.com/dhsig86/OTTO-AERODIG |

---

## Variáveis de ambiente

### Frontend (`.env.local`)
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_API_URL=http://localhost:8003
```

### Backend (`.env`)
```
FIREBASE_SERVICE_ACCOUNT_JSON=
FRONTEND_URL=http://localhost:5176
DEEPSEEK_API_KEY=        # ou GROQ_API_KEY
PUBMED_API_KEY=          # opcional, NCBI E-utilities
NEWS_CRON_SECRET=        # token para autorizar /api/jobs/pubmed-daily
```

---

## Próximos passos (após scaffold v0.1)

1. **Sprint 1:** Validar e enriquecer 9 condições seed com fontes da pasta AERODIGESTIVE BOOKS AND ARTICLES.
2. **Sprint 2:** Cron Render rodando + admin de curadoria + primeira leva de 50 news curadas.
3. **Sprint 3:** Scrapers de eventos + calendário público.
4. **Sprint 4:** Embed no PWA (`mapa_modulos.md` + tile + profile gating).

Detalhes em [PLAN.md](./PLAN.md).

---

## Testes — sempre rodar antes de commitar

```bash
# Backend
cd aerodig-backend && pytest -q

# Frontend
cd aerodig-frontend && npm run test:run && npm run typecheck
```

CI bloqueia PR se algum check falha — integridade do hub é prioridade.

---

## Comandos git no Cowork

⚠️ Push **não funciona** dentro do bash do Cowork (sem credenciais).
Após Claude commitar localmente, rodar no PowerShell Windows:

```powershell
cd "C:\Users\drdhs\OneDrive\Documentos\AOTTO ECOSYSTEM\OTTO AERODIG"
git push origin main
```
