# OTTO Aerodigestive Hub — Architecture

> Documentação arquitetural complementar ao [PLAN.md](./PLAN.md).

## Topologia

```
┌─────────────────────────────────────────────────────────────────┐
│  OTTO PWA (otto.drdariohart.com / ottopwa.vercel.app)           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ <iframe src="https://otto-aerodig.vercel.app" />          │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  Frontend SPA (Vercel)                                           │
│  React 18 + TypeScript + Vite + Tailwind + react-router-dom v7   │
│  Firebase Auth (Google login, uid compartilhado com ecossistema) │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ axios HTTPS
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  Backend FastAPI (Render)                                        │
│  Routers: conditions, pathways, instruments, procedures,         │
│           frontier, network, news, events, search                │
│  Services: pubmed, llm, relevance_score, content_loader          │
│  Jobs: pubmed_daily (cron Render 06:00 BRT)                      │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┴────────────────┐
                ▼                                ▼
┌────────────────────────┐         ┌────────────────────────────┐
│  Firestore (Firebase)  │         │  PubMed E-utilities + RSS  │
│  Coleções:             │         │  + DeepSeek/Groq LLM API   │
│   conditions/          │         │                            │
│   pathways/            │         │  (consumo externo)         │
│   instruments/         │         │                            │
│   procedures/          │         └────────────────────────────┘
│   frontier/            │
│   network_nodes/       │
│   news_items/          │
│   events/              │
│   audit_log/           │
└────────────────────────┘
```

## Decisões arquiteturais (ADRs resumidos)

### ADR-001: Por que Firestore para curadoria editorial e não Postgres?
- **Decisão:** Firestore.
- **Por quê:** Ecossistema OTTO já está em Firestore. Auth uid universal. Volume editorial é pequeno (centenas de docs, não milhões). Real-time listeners para o admin de curadoria.
- **Quando reverter:** se a coleção `news_items` ultrapassar 10k itens com queries complexas, mover apenas ela para Postgres no Render.

### ADR-002: Por que iframe e não micro-frontend (module federation)?
- **Decisão:** iframe + CSP `frame-ancestors`.
- **Por quê:** Padrão já usado por todos os módulos do OTTO PWA (BOTTOK, Atlas, CALC-HUB, Cases). Isolamento total de bundle, deploys independentes, sem acoplamento de runtime.
- **Trade-off:** menos UX integrada (transições de página são "saltos"). Aceitável para um hub denso de conteúdo.

### ADR-003: Por que separar `seeds/` (JSON) e Firestore?
- **Decisão:** Dois níveis. JSON em `seeds/` é a fonte canônica versionada em git; Firestore é a réplica operacional.
- **Por quê:** Conteúdo editorial precisa estar versionado (PRs, code review, blame). Firestore serve apenas como cache leitura para o frontend e fila de curadoria. Script `scripts/seed-firestore.py` sincroniza JSON → Firestore.
- **Implicação:** Verbetes são editados como JSON (PR review obrigatório), não diretamente no Firestore.

### ADR-004: Por que cron no Render e não Cloud Functions?
- **Decisão:** Cron Render.
- **Por quê:** Backend já está no Render. Cron job é mais barato (incluído no plano) e mais simples de debugar. `POST /api/jobs/pubmed-daily` autenticado por secret token.

### ADR-005: Por que React Router v7 e não TanStack Router?
- **Decisão:** React Router v7.
- **Por quê:** Stack já usado pelo OTTO PWA. Estabilidade.

### ADR-006: Por que vitest e não Jest?
- **Decisão:** vitest.
- **Por quê:** Roda nativo em Vite (sem ts-jest, sem babel). Compatível com @testing-library/react. CI mais rápido.

### ADR-007: Por que axios e não fetch nativo?
- **Decisão:** axios.
- **Por quê:** Já usado pelo PROTTO. Interceptors para Firebase Auth Bearer token. Tratamento centralizado de erro.

---

## Fluxo de autenticação

```
1. Usuário acessa otto-aerodig.vercel.app (direto ou via iframe do PWA)
2. AuthGuard verifica Firebase Auth currentUser
3. Se não logado → LoginScreen (Google sign-in)
4. Após login, idToken é salvo
5. axios interceptor anexa Authorization: Bearer <idToken> em toda request
6. Backend valida idToken via firebase-admin (firebase_db.verify_token)
7. Endpoints públicos (Atlas, News, Events) não exigem auth
8. Endpoints de curadoria (POST /news/{id}/approve) exigem custom claim role='curator'
```

## Profile gating

Quando embarcado no PWA, o tile "Aerodigestive" só aparece para perfis `medico`, `estudante`, `profissional` (mesmo gating de BOTTOK/CALC-HUB).
A página direta `otto-aerodig.vercel.app` é pública (educacional), mas com banner "Conteúdo educacional, não substitui avaliação médica".

---

## Pipeline de news — fluxograma

```
┌─────────────────────┐
│ Cron Render 06:00   │
│ POST /jobs/pubmed   │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ ESearch por query   │  para cada query em seeds/pubmed-queries.json
│ (últimos 14 dias)   │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ EFetch metadados    │  XML → dict
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ relevance_score     │  IF tier + recency + keyword + MeSH
└──────────┬──────────┘
           ▼
   score >= 0.4 ?
           ├── Não → descarta
           ▼
┌─────────────────────┐
│ llm.summarize_ptbr  │  3 linhas em PT-BR (DeepSeek/Groq)
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ Firestore upsert    │  status='pending', curator_uid=null
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ Curador no /admin   │  approve / reject
│ (futuro Sprint 2)   │
└─────────────────────┘
```

## Métricas observabilidade

- Backend logs estruturados (uvicorn + custom JSON logger).
- Sentry no frontend (futuro Sprint 6).
- Render dashboard para cron history.
- Firebase Analytics para rotas.
