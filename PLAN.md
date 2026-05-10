# OTTO Aerodigestive Hub — PLAN.md

> **Status:** v0.1 (planejamento — pré-scaffold)
> **Autor:** Dario Hart + Claude (modo ultrathink, 2026-05-09)
> **Repo destino:** https://github.com/dhsig86/OTTO-AERODIG.git
> **Embed PWA:** otto-aerodig.vercel.app via iframe com CSP `frame-ancestors`

---

## 1 · Por que este módulo existe

A medicina aerodigestiva é, por definição, **interdisciplinar**: laringe, traqueia, esôfago, deglutição, sono e crescimento de uma criança examinados por uma única equipe. No Brasil há ilhas de excelência (UNICAMP, HCPA-UFRGS, Fiocruz/IFF, Aeroped) mas falta uma **infraestrutura editorial compartilhada**: taxonomia comum, outcome-set comum, mapa de centros, repertório de instrumentos em PT-BR, curadoria pública dos casos transversais.

O OTTO Aerodigestive Hub preenche esse vazio. Não é "mais um atlas". É um **sistema operacional clínico-editorial** com seis camadas conectadas: Atlas, Pathways, Instrumentos, Procedimentos, Radar de Fronteira e Mapa de Rede — mais News e Eventos como vetores de tráfego recorrente.

---

## 2 · Princípios de design (regras editoriais não-negociáveis)

| # | Regra | Por quê |
|---|-------|---------|
| 1 | **Separar padrão de cuidado, variante de centro e experimental.** Cada item carrega esse rótulo. | Slide tracheoplasty é padrão; splints 3D bioabsorvíveis são fronteira. Misturar os dois desinforma. |
| 2 | **Organizar por decisão, não apenas por anatomia.** O caso aerodigestivo típico atravessa especialidades. | Estridor pode ser laringomalácia, lesão pós-intubação, fenda ou doença traqueal. O fluxo precisa partir do sintoma. |
| 3 | **Outcome-sets em toda página de procedimento.** | Decanulação, reintervenção, voz, deglutição, complicações, follow-up — sempre presentes, sempre mensuráveis. |
| 4 | **Ledger de confiança** (alta / média / baixa) em todo verbete. | Diferencia consenso internacional de nomenclatura emergente. É o ativo editorial mais valioso do hub. |
| 5 | **Educação como produto principal.** Casos, vídeos, checklists, simulação. (v2) | Lausanne, Cincinnati e a Aerodigestive Society tratam educação como output central. |
| 6 | **Não personalizar recomendação clínica.** | Hub é educacional. Conteúdo nunca substitui avaliação médica. |
| 7 | **Dados brasileiros sempre que existirem; sinalizar quando faltarem.** | DATASUS, SciELO, BVS, LILACS antes de extrapolar do exterior. |

---

## 3 · Decisões fechadas (Sprint 0 — 2026-05-09)

| Decisão | Valor | Justificativa |
|---|---|---|
| Escopo etário MVP | **Pediátrico** | A literatura sólida do campo é pediátrica. Estrutura preparada para adulto v2 (feature flag `audience: 'pediatric' \| 'adult' \| 'both'` em todo verbete). |
| Stack | **FastAPI (Render) + React+TS+Vite+Tailwind (Vercel) + Firebase Auth/Firestore** | Mesmo padrão do PROTTO — zero retrabalho de integração no PWA. |
| Embed | **iframe com CSP `frame-ancestors 'self' https://otto.drdariohart.com https://ottopwa.vercel.app`** | Padrão já validado em BOTTOK, Atlas, CALC-HUB, Cases. |
| Domínio público | **otto-aerodig.vercel.app** (custom CNAME opcional em v1.1) | Subir rápido sem DNS. |
| Perfis de acesso PWA | **medico + estudante + profissional** | Mesmo gating do BOTTOK/CALC-HUB. Trilha "Famílias" para perfil paciente fica em v2. |
| Camadas v1 | **Atlas + Pathways + Instrumentos + Procedimentos + Fronteira + Rede + News + Eventos** | Tudo da arquitetura recomendada da deep research, exceto "Aprender fazendo" que é v2. |
| Ledger de confiança | **MVP** | Diferenciador central. Schema obriga campo `confidence: 'high' \| 'moderate' \| 'low'` + `confidence_rationale`. |
| Mapa de rede | **MVP, 7 nós** | UNICAMP, HCPA-UFRGS, Fiocruz/IFF, Aeroped, UFRJ/HUCFF, Cincinnati (Rutter), CHUV/Lausanne (Monnier). |
| Outcome sets | **MVP, obrigatório** | Schema de procedimento obriga campos: decannulation, reintervention, voice, swallow, complications, followup. |
| Pipeline News | **PubMed E-utilities + DeepSeek/Groq resumo PT-BR + RSS revistas** | Cron diário no Render; fila de curadoria humana antes de publicar. |
| Pipeline Eventos | **Agregador + entrada manual** | Scraper agenda Aerodigestive Society + AAO-HNS + ELS + ABORL-CCF + SBP + formulário admin. |
| Idioma | **PT-BR primário, EN para termos clínicos consolidados** | "subglottic stenosis" em itálico ao lado de "estenose subglótica". Bilíngue toggle em v2. |
| Testes | **vitest (frontend) + pytest (backend) + GitHub Actions CI** | Bloqueio de regressão desde o primeiro commit. |
| Repositório | **github.com/dhsig86/OTTO-AERODIG** (vazio, será inicializado) | Pasta local: `OTTO AERODIG/` (com espaço, padrão do ecossistema). |
| Conteúdo MVP | **9 condições prioritárias** | Laringomalácia, fenda laríngea, LTS/SGS, lesão pós-intubação, traqueomalácia, estenose traqueal congênita, EA/FTE, disfagia/aspiração, EoE+DRGE+SAOS pediátrico. |

---

## 4 · Arquitetura física

```
otto-aerodig.vercel.app                    https://otto-aerodig-api.onrender.com
       (frontend SPA)                              (backend FastAPI)
              │                                            │
              │ GET /api/conditions                        │
              │ GET /api/pathways                          │
              │ GET /api/instruments                       │
              │ GET /api/procedures                        │
              │ GET /api/frontier                          │
              │ GET /api/network                           │
              │ GET /api/news?status=published             │
              │ GET /api/events                            │
              │ GET /api/search?q=...                      │
              ├────────────────────────────────────────────┤
              │ Firebase Auth (Google) — uid universal     │
              │ shared with otto-pwa, protto, cases, etc.  │
              └────────────────────────────────────────────┘
                                    │
                                    ▼
                          ┌─────────────────────┐
                          │ Firestore (curadoria editorial leve)
                          │  - conditions/{id}
                          │  - pathways/{id}
                          │  - instruments/{id}
                          │  - procedures/{id}
                          │  - frontier/{id}
                          │  - network_nodes/{id}
                          │  - news_items/{pmid}      (status: pending|published|rejected)
                          │  - events/{id}
                          │  - users/{uid}            (papel: curador|leitor)
                          │  - audit_log/{ts}
                          └─────────────────────┘

Cron Render (diário 06:00 BRT)
       │
       └─→ jobs.pubmed_daily.py
              ├─ ESearch (queries em seeds/pubmed-queries.json)
              ├─ EFetch metadados
              ├─ services.relevance_score → score 0..1
              ├─ services.llm.summarize_ptbr → resumo 3 linhas
              └─ Firestore.news_items (status='pending')
                   └─ Curador valida via /admin → status='published'
```

---

## 5 · Modelo de conteúdo (schemas Pydantic & TS)

Todas as entidades compartilham os campos:

```python
class BaseEntity(BaseModel):
    id: str
    slug: str
    title_pt: str
    title_en: str
    audience: Literal['pediatric', 'adult', 'both'] = 'pediatric'
    confidence: Literal['high', 'moderate', 'low']
    confidence_rationale: str
    created_at: datetime
    updated_at: datetime
    sources: list[Source]   # PMID, DOI, URL, autor, ano, tipo
```

### 5.1 Condition (atlas)
```python
class Condition(BaseEntity):
    domain: Literal['larynx','trachea','esophagus','swallowing','sleep','genetic','vascular']
    age_range: list[str]            # ['neonate','infant','toddler','school','adolescent']
    classifications: list[Classification]   # Olney, Benjamin-Inglis, Myer-Cotton, ...
    red_flags: list[str]
    key_exams: list[str]            # FEES, VFSS, broncoscopia, pH-impedância
    common_pitfalls: list[str]
    associated_pathways: list[str]  # ids de Pathway
    associated_procedures: list[str]
    associated_instruments: list[str]
    epidemiology_global: Optional[str]
    epidemiology_brazil: Optional[str]   # NULL se ausente; sinalizar
```

### 5.2 Pathway (fluxo de decisão)
```python
class Pathway(BaseEntity):
    entry_symptom: str              # 'estridor persistente após extubação', ...
    nodes: list[PathwayNode]        # decision/exam/intervention/followup
    edges: list[PathwayEdge]        # condicionais
    output_artifacts: list[str]     # ids de Procedure ou Condition
```

### 5.3 Instrument (escala / score)
```python
class Instrument(BaseEntity):
    instrument_type: Literal['screening','functional','outcome','histologic','endoscopic']
    domain: str                     # 'swallowing','sleep','reflux','EoE','airway',...
    items_count: int
    interpretation: str
    pediatric_validated: bool
    ptbr_validated: bool
    original_paper: Source
    digital_calculator_available: bool
    notes: Optional[str]
```

### 5.4 Procedure (intervenção)
```python
class Procedure(BaseEntity):
    surgical: bool
    approach: Literal['endoscopic','open','adjuvant','combined']
    indications: list[str]
    contraindications: list[str]
    outcome_set: OutcomeSet         # decannulation, reintervention, voice, swallow, complications, followup
    technique_notes: str
    learning_curve_evidence: Optional[str]
    centers_high_volume: list[str]  # ids de NetworkNode
```

### 5.5 FrontierItem (radar de fronteira)
```python
class FrontierItem(BaseEntity):
    technology: Literal['ai','3d_printing','genomics','bioabsorbable','biomarker','tissue_engineering']
    maturity: Literal['exploratory','translational','clinical_trial','approved_specialized','approved_widespread']
    available_in_brazil: bool
    anvisa_status: Optional[str]
    cost_signal: Literal['low','medium','high','unknown']
    representative_papers: list[Source]
```

### 5.6 NetworkNode (mapa de rede)
```python
class NetworkNode(BaseEntity):
    node_type: Literal['center','specialist','course','fellowship']
    country: str
    city: str
    institution: str
    specialist_name: Optional[str]
    focus_areas: list[str]
    public_contact: Optional[str]
    public_url: Optional[str]
```

### 5.7 NewsItem
```python
class NewsItem(BaseEntity):
    pmid: Optional[str]
    doi: Optional[str]
    journal: str
    pub_date: date
    abstract_en: str
    summary_ptbr: str               # gerado por LLM, revisado por curador
    relevance_score: float          # 0..1
    domain_tags: list[str]          # MeSH-derived
    status: Literal['pending','published','rejected','archived']
    curator_uid: Optional[str]
    curator_notes: Optional[str]
```

### 5.8 Event (congresso/curso)
```python
class Event(BaseEntity):
    event_type: Literal['congress','course','symposium','webinar','fellowship']
    organizer: str
    location: str
    starts_on: date
    ends_on: date
    url: str
    cme_credits: Optional[float]
    target_audience: list[str]      # ['ent','speech','ped_pulm','ped_gi','anesthesia']
    registration_open: bool
    notes_ptbr: Optional[str]
```

---

## 6 · Contratos de API (REST, FastAPI)

| Método | Rota | Resposta | Auth |
|---|---|---|---|
| GET | `/health` | `{status, service, version}` | público |
| GET | `/api/conditions` | `Condition[]` | público (paginado) |
| GET | `/api/conditions/{slug}` | `Condition` | público |
| GET | `/api/pathways` | `Pathway[]` | público |
| GET | `/api/pathways/{slug}` | `Pathway` | público |
| GET | `/api/instruments` | `Instrument[]` | público |
| GET | `/api/instruments/{slug}` | `Instrument` | público |
| GET | `/api/procedures` | `Procedure[]` | público |
| GET | `/api/procedures/{slug}` | `Procedure` | público |
| GET | `/api/frontier` | `FrontierItem[]` | público |
| GET | `/api/network` | `NetworkNode[]` | público |
| GET | `/api/news?status=published` | `NewsItem[]` | público |
| GET | `/api/news/pending` | `NewsItem[]` | curador |
| POST | `/api/news/{id}/approve` | `NewsItem` | curador |
| POST | `/api/news/{id}/reject` | `NewsItem` | curador |
| GET | `/api/events?upcoming=true` | `Event[]` | público |
| GET | `/api/search?q=...` | `SearchResult` | público |
| POST | `/api/jobs/pubmed-daily` | `JobReport` | secret token (Render cron) |

CORS: `FRONTEND_URL` env var + `localhost:5176` dev. iframe headers: `X-Frame-Options: ALLOW-FROM https://otto.drdariohart.com` + CSP `frame-ancestors`.

---

## 7 · Pipeline de News — detalhe

```
06:00 BRT (Render Cron Job, secret token)
  │
  ├─ services.pubmed.search()      # ESearch para cada query em seeds/pubmed-queries.json
  │       queries: aerodigestive, pediatric airway, laryngotracheal,
  │                tracheoesophageal fistula, laryngomalacia,
  │                tracheomalacia, eosinophilic esophagitis pediatric,
  │                FEES pediatric, VFSS pediatric
  │
  ├─ services.pubmed.fetch()       # EFetch metadados (XML→dict)
  │
  ├─ services.relevance_score.score()
  │       fatores:
  │         - journal IF tier (IJPORL=1.0, Laryngoscope=0.95, JAMA Oto=1.0, ...)
  │         - keyword density
  │         - recency (últimos 14 dias bonus)
  │         - MeSH match
  │       output: 0..1
  │
  ├─ filtra score >= 0.4
  │
  ├─ services.llm.summarize_ptbr() # DeepSeek ou Groq (3 linhas em PT-BR)
  │
  └─ Firestore.news_items.create()  # status='pending'
          └─ envia notificação ao curador (futuro)
```

Reprocessamento: se um PMID já existe em `news_items`, atualiza score e tags mas não duplica.

---

## 8 · Pipeline de Eventos

| Fonte | Método | Frequência |
|---|---|---|
| Aerodigestive Society (https://www.aerodigestive.org/events) | scraper HTML semanal | 1× / semana |
| AAO-HNS (https://www.entnet.org/events) | scraper | 1× / semana |
| ELS (https://elsoc.org) | scraper | 1× / semana |
| ABORL-CCF (https://www.aborlccf.org.br) | scraper | 1× / semana |
| SBP (https://www.sbp.com.br) | scraper | 1× / semana |
| Eventos brasileiros (HCPA simpósio, UNICAMP cursos) | formulário admin | manual |

Deduplicação por `(organizer, title, starts_on)` hash.

---

## 9 · Estrutura de pastas do repositório

```
OTTO AERODIG/
├── README.md
├── CLAUDE.md
├── PLAN.md                        ← este arquivo
├── ARCHITECTURE.md
├── CONTRIBUTING.md
├── .gitignore
├── .github/
│   └── workflows/
│       ├── ci-backend.yml         pytest + ruff
│       └── ci-frontend.yml        vitest + tsc + eslint
├── docs/
│   ├── content-model.md
│   ├── api-spec.md
│   ├── news-pipeline.md
│   ├── taxonomy.md
│   └── confidence-ledger.md
├── aerodig-backend/
│   ├── main.py
│   ├── firebase_db.py
│   ├── render.yaml
│   ├── requirements.txt
│   ├── pytest.ini
│   ├── .env.example
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── conditions.py
│   │   ├── pathways.py
│   │   ├── instruments.py
│   │   ├── procedures.py
│   │   ├── frontier.py
│   │   ├── network.py
│   │   ├── news.py
│   │   ├── events.py
│   │   └── search.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── pubmed.py
│   │   ├── llm.py
│   │   ├── relevance_score.py
│   │   └── content_loader.py
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py
│   ├── jobs/
│   │   ├── __init__.py
│   │   └── pubmed_daily.py
│   ├── seeds/
│   │   ├── conditions/                (9 JSONs)
│   │   ├── instruments.json
│   │   ├── procedures.json
│   │   ├── frontier.json
│   │   ├── network-nodes.json
│   │   ├── pubmed-queries.json
│   │   └── society-events-sources.json
│   └── tests/
│       ├── conftest.py
│       ├── test_health.py
│       ├── test_conditions.py
│       ├── test_instruments.py
│       ├── test_procedures.py
│       ├── test_news.py
│       ├── test_events.py
│       ├── test_search.py
│       ├── test_relevance_score.py
│       └── test_content_loader.py
├── aerodig-frontend/
│   ├── package.json
│   ├── index.html
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   ├── vitest.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vercel.json
│   ├── .env.example
│   ├── public/
│   │   └── icon.svg
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       ├── vite-env.d.ts
│       ├── types/content.ts
│       ├── services/
│       │   ├── firebase.ts
│       │   └── api.ts
│       ├── hooks/
│       │   ├── useAuth.ts
│       │   └── useContent.ts
│       ├── components/
│       │   ├── Layout.tsx
│       │   ├── Sidebar.tsx
│       │   ├── ConfidenceBadge.tsx
│       │   └── ConditionCard.tsx
│       ├── pages/
│       │   ├── HomePage.tsx
│       │   ├── AtlasPage.tsx
│       │   ├── ConditionPage.tsx
│       │   ├── PathwaysPage.tsx
│       │   ├── InstrumentsPage.tsx
│       │   ├── ProceduresPage.tsx
│       │   ├── FrontierPage.tsx
│       │   ├── NetworkPage.tsx
│       │   ├── NewsPage.tsx
│       │   ├── EventsPage.tsx
│       │   └── SearchPage.tsx
│       └── tests/
│           ├── setup.ts
│           ├── App.test.tsx
│           ├── HomePage.test.tsx
│           ├── ConditionPage.test.tsx
│           ├── ConfidenceBadge.test.tsx
│           └── api.test.ts
└── scripts/
    ├── git-init.ps1
    └── seed-firestore.py
```

---

## 10 · Plano de testes (anti-regressão desde o dia 1)

### Backend (pytest)
| Arquivo | O que testa |
|---|---|
| `test_health.py` | `/health` retorna 200 e shape correto |
| `test_conditions.py` | Listagem retorna 9 condições seed; `/api/conditions/laringomalacia` retorna o verbete completo; campos obrigatórios presentes |
| `test_instruments.py` | Listagem; PEDI-EAT-10, PSQ, EREFS, Myer-Cotton, Benjamin-Inglis presentes |
| `test_procedures.py` | Outcome-set obrigatório; slide_tracheoplasty, supraglotoplastia, LTR, PCTR presentes |
| `test_news.py` | Mock E-utilities; news pending → published por curador; rejection path |
| `test_events.py` | Listagem ordenada por data; filtro upcoming |
| `test_search.py` | Busca textual cross-camadas retorna mix de tipos |
| `test_relevance_score.py` | Score em [0,1]; sensibilidade a journal IF, recency, keyword density |
| `test_content_loader.py` | Validação Pydantic de todos os JSONs em seeds/ |

### Frontend (vitest + @testing-library/react)
| Arquivo | O que testa |
|---|---|
| `App.test.tsx` | Renderiza Layout sem crash; rotas principais respondem |
| `HomePage.test.tsx` | Cards das camadas presentes; CTA navegação |
| `ConditionPage.test.tsx` | Renderiza verbete mock; classificações; ledger badge |
| `ConfidenceBadge.test.tsx` | Cores corretas para high/moderate/low; rationale tooltip |
| `api.test.ts` | Cliente axios faz GET correto; trata erro 5xx |

### CI (.github/workflows)
- `ci-backend.yml`: `pip install -r requirements.txt && pytest -q && ruff check`
- `ci-frontend.yml`: `npm ci && npm run typecheck && npm run lint && npm run test:run && npm run build`

Cada PR é bloqueado se um dos dois falha.

---

## 11 · Roadmap (fases)

| Sprint | Duração | Entregáveis |
|---|---|---|
| **0 — Scaffold** (este) | 1d | Estrutura completa, 9 seeds, testes verdes, CI verde, deploy preview na Vercel/Render |
| **1 — Conteúdo seed validado** | 1 sem | 9 condições com fontes citadas; 12 instrumentos; 8 procedimentos; 7 nós de rede; 6 itens de fronteira |
| **2 — Pipeline News funcionando** | 1 sem | Cron Render rodando 06:00 BRT; admin de curadoria; primeira leva de 50 artigos curados |
| **3 — Pipeline Eventos** | 1 sem | Scrapers das 5 sociedades; calendário público; formulário admin |
| **4 — Embed no PWA + auth** | 3d | Tile no `mapa_modulos.md`; iframe ativo; profile gating funcionando |
| **5 — Indexação dos PDFs/livros** | 1 sem | Pasta AERODIGESTIVE BOOKS AND ARTICLES indexada; busca cross-PDFs no `/search` |
| **6 — Polimento + lançamento beta** | 1 sem | Bug-fix; SEO meta; OG images; analytics; convite a UNICAMP/HCPA para revisar |
| **7 — Camada "Aprender fazendo"** (v2) | 2 sem | Casos clínicos; checklists; vídeos curtos; modelos 3D |
| **8 — Trilha "Famílias"** (v2) | 1 sem | Conteúdo simplificado para perfil paciente |
| **9 — Adulto** (v2) | 2 sem | Toggle audience; verbetes adicionais (laringe pós-intubação adulto, disfagia idoso, EoE adulto) |

---

## 12 · Riscos e mitigações

| Risco | Severidade | Mitigação |
|---|---|---|
| Curadoria humana lenta para news (gargalo) | Alta | LLM pré-filtra + auto-summary; bulk approve UI; meta de 5min/artigo |
| Custo de LLM | Baixa | DeepSeek é ~$0.0014/1k tokens; resumos curtos; cache de prompts |
| Scrapers de sociedades quebram | Média | Cron monitora 0 resultados; fallback formulário admin |
| Conteúdo desatualizado | Média | Campo `updated_at` exibido; alerta visual >12 meses |
| Erros editoriais | Alta | Curadoria pareada com referências de UNICAMP/HCPA antes de v1.0; ledger explícito |
| Domínio Vercel não-profissional para palestras | Baixa | Adicionar CNAME em v1.1 |
| Acessibilidade | Média | Tailwind + componentes acessíveis; lighthouse ≥90 |

---

## 13 · Métricas de sucesso (90 dias após lançamento)

| Métrica | Meta |
|---|---|
| Páginas de Atlas com fontes ≥3 e confidence ≠ low | ≥ 8 / 9 |
| Artigos News publicados | ≥ 200 |
| Eventos cadastrados | ≥ 30 |
| MAU dentro do PWA (otto-aerodig route) | ≥ 50 |
| Especialistas brasileiros que aceitaram virar curadores | ≥ 3 |
| Lighthouse performance | ≥ 85 |
| Cobertura de testes backend | ≥ 70% |
| Tempo de cron diário PubMed | < 5 min |

---

## 14 · Apêndice A — Fontes-base (deep research, citações resumidas)

- Consenso de programas aerodigestivos (2018) — define paciente, equipe mínima, FEES/VFSS, coordenação.
- Survey 2017 de 34 programas — fotografia da expansão.
- Standards Califórnia (2021) — checklist operacional de centro.
- Cincinnati / Mike Rutter — referência histórica e organizacional.
- CHUV / Philippe Monnier — escola de PCTR, classificação, formação.
- UNICAMP / Rebecca Maunsell — airway team brasileiro, traqueostomia, programa aerodigestivo inicial.
- HCPA / Claudia Schweiger — lesão pós-intubação, CALI.
- Fiocruz/IFF / Paulo Pires de Mello — endoscopia respiratória pediátrica.
- Diretriz EoE pediátrico 2024.
- NASPGHAN/ESPGHAN DRGE pediátrico.
- Scoping review IA em via aérea pediátrica 2024.
- Aerodigestive Society — agenda do campo, conferência Santiago 2024.

---

## 15 · Apêndice B — Comando de inicialização git (para o usuário rodar no Windows)

```powershell
cd "C:\Users\drdhs\OneDrive\Documentos\AOTTO ECOSYSTEM\OTTO AERODIG"
git init
git add .
git commit -m "feat(scaffold): OTTO Aerodigestive Hub — estrutura inicial v0.1

- Backend FastAPI + Render (routers: conditions, pathways, instruments, procedures, frontier, network, news, events, search)
- Frontend React+TS+Vite+Tailwind + Vercel
- 9 condições seed + ledger de confiança + outcome sets + mapa de rede (7 nós)
- Pipeline News (PubMed E-utilities + LLM resumo PT-BR)
- Pipeline Eventos (5 sociedades + entrada manual)
- Tests: pytest (backend) + vitest (frontend) + GitHub Actions CI
- Documentação: PLAN.md, ARCHITECTURE.md, docs/ (content-model, api-spec, news-pipeline, taxonomy, confidence-ledger)"
git branch -M main
git remote add origin https://github.com/dhsig86/OTTO-AERODIG.git
git push -u origin main
```
