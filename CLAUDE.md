# OTTO Aerodigestive Hub — CLAUDE.md

> Contexto operacional para sessões de Claude/IA. Atualizado: 2026-05-24.
> Leitura integral do código-fonte: backend + frontend + docs + seeds.

---

## O que é este módulo

Hub clínico-editorial brasileiro de **medicina aerodigestiva pediátrica**.
Módulo do **OTTO Ecosystem** (junto com PWA, PROTTO, BOTTOK, Atlas, CALC-HUB, Cases, Voice, etc).

Padrão arquitetural: **clone do OTTO PROTTO** — FastAPI (Render) + React+TS+Vite+Tailwind (Vercel) + Firebase Auth/Firestore.

---

## Build & Test Commands

### Backend (Python / FastAPI)

```bash
cd aerodig-backend

# Ambiente virtual
python -m venv venv
# Windows: venv\Scripts\activate
source venv/bin/activate
pip install -r requirements.txt

# Servidor dev (porta 8003)
uvicorn main:app --reload --port 8003

# Testes
pytest -q                            # roda todos os testes
pytest tests/test_conditions.py -v   # teste específico
pytest tests/test_relevance_score.py # valida pipeline de scoring

# Lint (CI)
ruff check .
```

### Frontend (React + TypeScript + Vite)

```bash
cd aerodig-frontend
npm install

# Dev (porta 5176, proxy /api → localhost:8003)
npm run dev

# Build produção
npm run build

# Testes
npm run test:run          # vitest run (CI-friendly, single pass)
npm run test              # vitest watch mode

# Typecheck + lint
npm run typecheck         # tsc -b --noEmit
npm run lint              # eslint src --ext ts,tsx
```

### Estrutura de testes

**Backend** (`aerodig-backend/tests/`):

| Arquivo | O que valida |
|---------|-------------|
| `test_health.py` | Endpoint `/health` retorna `status: ok` |
| `test_content_loader.py` | Todos os JSONs seed são parsáveis pelo Pydantic |
| `test_conditions.py` | 9 condições seed carregam corretamente |
| `test_instruments.py` | Instrumentos com campos obrigatórios |
| `test_procedures.py` | **Outcome set obrigatório** em todo procedimento |
| `test_events.py` | Eventos com data válida |
| `test_news.py` | NewsItems com status válido |
| `test_search.py` | Busca cross-camadas retorna hits |
| `test_pubmed_service.py` | Parse XML do EFetch |
| `test_relevance_score.py` | Pesos do scoring em [0, 1] |
| `test_calculators.py` | Calculadoras carregam e têm inputs/outputs |

**Frontend** (`aerodig-frontend/src/tests/`):

| Arquivo | O que valida |
|---------|-------------|
| `App.test.tsx` | Renderiza rotas corretamente |
| `HomeBage.test.tsx` | Página home renderiza |
| `ConfidenceBadge.test.tsx` | Badge exibe nível e rationale |
| `ErrorBoundary.test.tsx` | Error boundary captura erros |
| `api.test.ts` | Funções de fetch em modo estático |
| `seeds-integrity.test.ts` | JSONs em `public/data/` são válidos |
| `myer-cotton.test.ts` | Lógica de cálculo Myer-Cotton |
| `MyCottonComponent.test.tsx` | Componente renderiza |
| `PediEat10Calculator.test.tsx` | Componente PEDI-EAT-10 renderiza |
| `TracheostomyConverter.test.tsx` | Componente conversor renderiza |
| `PathwayDiagram.test.tsx` | Diagrama de fluxo renderiza |
| `useDocumentTitle.test.ts` | Hook de título funciona |

---

## Estrutura de Pastas

```
OTTO AERODIG/
├── aerodig-backend/               FastAPI → Render — porta dev 8003
│   ├── main.py                    App FastAPI, CORS, iframe headers
│   ├── firebase_db.py             Init Firebase Admin + verify_token + is_curator
│   ├── routers/
│   │   ├── conditions.py          GET /api/conditions[/{slug}]
│   │   ├── pathways.py            GET /api/pathways[/{slug}]
│   │   ├── instruments.py         GET /api/instruments[/{slug}]
│   │   ├── procedures.py          GET /api/procedures[/{slug}]
│   │   ├── calculators.py         GET /api/calculators[/{slug}]
│   │   ├── frontier.py            GET /api/frontier[/{slug}]
│   │   ├── network.py             GET /api/network[/{slug}]
│   │   ├── news.py                GET /api/news[/{slug}]
│   │   ├── events.py              GET /api/events[/{slug}]
│   │   ├── search.py              GET /api/search
│   │   └── jobs.py                POST /api/jobs/pubmed-daily
│   ├── services/
│   │   ├── pubmed.py              ESearch + EFetch (NCBI E-utilities)
│   │   ├── relevance_score.py     Score [0,1]: journal + recency + keyword + MeSH
│   │   ├── llm.py                 DeepSeek (preferred) / Groq fallback — resumo PT-BR
│   │   └── content_loader.py      Lê seeds/ JSON → Pydantic models
│   ├── jobs/
│   │   └── pubmed_daily.py        Orquestração cron: fetch → score → summarize → Firestore
│   ├── models/
│   │   └── schemas.py             Pydantic schemas (Condition, Pathway, Instrument, etc.)
│   ├── seeds/                     JSONs canônicos (fonte de verdade versionada em git)
│   │   ├── conditions/            9 JSONs individuais (1 por condição)
│   │   ├── pathways.json
│   │   ├── instruments.json
│   │   ├── procedures.json
│   │   ├── calculators.json       3 calculadoras: TracheostomyConverter, Myer-Cotton, PEDI-EAT-10
│   │   ├── frontier.json
│   │   ├── network-nodes.json
│   │   ├── news.json
│   │   ├── events.json
│   │   └── pubmed-queries.json    8 queries PubMed para o cron diário
│   ├── tests/                     11 arquivos pytest
│   ├── render.yaml                Blueprint Render (web + cron)
│   └── requirements.txt
│
├── aerodig-frontend/              React+TS+Vite → Vercel — porta dev 5176
│   ├── src/
│   │   ├── App.tsx                12 rotas (react-router-dom v6)
│   │   ├── pages/                 Home, Atlas, Condition, Pathways, Instruments,
│   │   │                          Calculators, Procedures, Frontier, Network,
│   │   │                          News, Events, Search, NotFound
│   │   ├── components/            Layout, Sidebar, ConfidenceBadge, ConditionCard, ErrorBoundary
│   │   ├── services/
│   │   │   ├── firebase.ts        Init Firebase (getAuthSafe, googleProvider)
│   │   │   └── api.ts             Axios com STATIC_MODE / API_MODE dual
│   │   ├── hooks/
│   │   │   └── useAuth.ts         onAuthStateChanged, login (Google popup), logout
│   │   ├── types/
│   │   │   └── content.ts         Espelha schemas.py (manter em sincronia)
│   │   └── tests/                 12 arquivos vitest
│   ├── public/data/               JSONs para modo estático (sem backend)
│   ├── vercel.json                CSP frame-ancestors + rewrite SPA
│   ├── vite.config.ts             Proxy /api → 8003, vitest config
│   ├── tailwind.config.js         Tokens otto-* + aerodig-*
│   └── package.json
│
├── docs/
│   ├── api-spec.md                Tabela de endpoints
│   ├── confidence-ledger.md       Guia editorial do ledger
│   ├── content-model.md           Modelo de dados e fluxo de contribuição
│   ├── news-pipeline.md           Documentação operacional do cron
│   └── taxonomy.md                Domínios, abordagens, tecnologias, eventos
│
├── ARCHITECTURE.md                ADRs + topologia + pipeline news
├── PLAN.md                        Roadmap completo
├── CLAUDE.md                      ← este arquivo
└── README.md                      Manual clínico
```

---

## Mapa Completo de Endpoints

### Rotas Públicas (sem auth)

| Método | Rota | Query params | Response | Descrição |
|--------|------|-------------|----------|-----------|
| GET | `/` | — | `{ service, docs, health }` | Root info |
| GET | `/health` | — | `{ status, service, version, frontend_url }` | Health check |
| GET | `/api/conditions` | `?domain=larynx` | `Condition[]` | Lista condições (filtro opcional por domain) |
| GET | `/api/conditions/{slug}` | — | `Condition` | Detalhe de condição |
| GET | `/api/pathways` | — | `Pathway[]` | Lista pathways de decisão |
| GET | `/api/pathways/{slug}` | — | `Pathway` | Detalhe de pathway |
| GET | `/api/instruments` | `?domain=swallowing` | `Instrument[]` | Lista instrumentos/escalas |
| GET | `/api/instruments/{slug}` | — | `Instrument` | Detalhe de instrumento |
| GET | `/api/procedures` | — | `Procedure[]` | Lista procedimentos (outcome set obrigatório) |
| GET | `/api/procedures/{slug}` | — | `Procedure` | Detalhe de procedimento |
| GET | `/api/calculators` | `?domain=airway` | `Calculator[]` | Lista calculadoras clínicas |
| GET | `/api/calculators/{slug}` | — | `Calculator` | Detalhe de calculadora |
| GET | `/api/frontier` | `?technology=ai` | `FrontierItem[]` | Radar de fronteira |
| GET | `/api/frontier/{slug}` | — | `FrontierItem` | Detalhe de item fronteira |
| GET | `/api/network` | `?country=BR&node_type=center` | `NetworkNode[]` | Mapa de rede |
| GET | `/api/network/{slug}` | — | `NetworkNode` | Detalhe do nó |
| GET | `/api/news` | `?status=published&limit=50` | `NewsItem[]` | Feed de news (ordenado por relevance desc → pub_date desc) |
| GET | `/api/news/{slug}` | — | `NewsItem` | Detalhe de news |
| GET | `/api/events` | `?upcoming=true&event_type=congress` | `Event[]` | Eventos futuros (ordenados por data) |
| GET | `/api/events/{slug}` | — | `Event` | Detalhe de evento |
| GET | `/api/search` | `?q=laringomalacia&limit=30` | `SearchResult` | Busca textual cross-camadas (8 entidades) |

### Rotas Protegidas (Cron / Admin)

| Método | Rota | Auth | Response | Descrição |
|--------|------|------|----------|-----------|
| POST | `/api/jobs/pubmed-daily` | Header `X-Cron-Secret` = `NEWS_CRON_SECRET` | `JobReport` | Trigger do pipeline PubMed diário |

### Swagger / OpenAPI

- Swagger UI: `{API_URL}/docs`
- ReDoc: `{API_URL}/redoc`

---

## Segurança, Auth & CORS

### CORS — Backend (`main.py`)

```python
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5176",
    "http://localhost:5175",
    "https://otto-aerodig.vercel.app",
    "https://otto.drdariohart.com",
    "https://ottopwa.vercel.app",
    os.getenv("FRONTEND_URL", ""),
]
# allow_credentials=True + allowlist explícita (NUNCA wildcard *)
```

### CSP / iframe — Backend (middleware HTTP)

Todos os endpoints recebem:
```
X-Frame-Options: ALLOW-FROM https://otto.drdariohart.com
Content-Security-Policy: frame-ancestors 'self' https://otto.drdariohart.com https://ottopwa.vercel.app https://otto-aerodig.vercel.app
```

### CSP / iframe — Frontend (`vercel.json`)

```json
{
  "headers": [{
    "source": "/(.*)",
    "headers": [
      { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
      { "key": "Content-Security-Policy", "value": "frame-ancestors 'self' https://otto.drdariohart.com https://ottos-plum.vercel.app https://ottopwa.vercel.app https://otto-aerodig.vercel.app" },
      { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
    ]
  }]
}
```

### Firebase Auth

- **Frontend:** `firebase.ts` → `getAuthSafe()` inicializa app se `apiKey` presente. `useAuth.ts` → `onAuthStateChanged`, `signInWithPopup(googleProvider)`, `signOut`.
- **Backend:** `firebase_db.py` → `verify_token(id_token)` valida Firebase ID token. `is_curator(decoded)` checa custom claim `role == 'curator'`.
- **Endpoints públicos** (Atlas, News, Events, Search): não exigem auth.
- **Curadoria futura** (approve/reject news): exigirá custom claim `role='curator'`.

### Autenticação do Cron Job

```python
def _check_secret(x_cron_secret):
    expected = os.getenv("NEWS_CRON_SECRET", "")
    if not expected: return  # dev sem secret, permite
    if x_cron_secret != expected: raise HTTPException(401)
```

---

## postMessage API (Embed no PWA)

Padrão ecossistema OTTO:
```js
// PWA → iframe
postMessage({ type: 'otto-context', payload: { userName, userId, firebaseToken } })

// iframe → PWA
postMessage({ type: 'otto-aerodig-ready' })
```

**Profile gating no PWA:** tile "Aerodigestive" aparece apenas para perfis `medico`, `estudante`, `profissional`.

---

## Frontend: Modo Estático vs. API

O frontend opera em dois modos (`api.ts`):

| Modo | Quando | Comportamento |
|------|--------|---------------|
| **STATIC_MODE** | `VITE_API_URL` vazio + `localhost` | Lê JSONs de `/data/` (pasta `public/`) via `fetch` |
| **API_MODE** | `VITE_API_URL` definido OU produção (fallback `https://otto-aerodig-api.onrender.com`) | Requisições `GET /api/*` via axios |

Isso permite deploy no Vercel **sem backend rodando** para demonstrações.

---

## Pipeline PubMed Daily (News)

### Fluxo completo

```
06:00 BRT (cron Render — render.yaml: "0 9 * * *" UTC)
    ↓
POST /api/jobs/pubmed-daily  (header X-Cron-Secret)
    ↓
jobs/pubmed_daily.run_once()
    ↓
Para cada query em seeds/pubmed-queries.json (8 queries):
    ↓
services/pubmed.esearch(term, max_results, days=14)
    → retorna lista de PMIDs (últimos 14 dias)
    ↓
services/pubmed.efetch(pmids)
    → parse XML → dict{pmid, title, journal, year, abstract, mesh_terms, doi}
    ↓
services/relevance_score.score(article) → float [0, 1]
    ↓
    score >= 0.4 ?
    ├── Não → descarta
    └── Sim ↓
        services/llm.summarize_ptbr(title, abstract, journal, year)
            → 3 linhas PT-BR (DeepSeek preferred / Groq fallback)
        ↓
        Firestore: news_items/{pmid}.set(payload, merge=True)
            status='pending', curator_uid=null
```

### Queries PubMed configuradas (`seeds/pubmed-queries.json`)

| Query | Termos | Max | Tags |
|-------|--------|-----|------|
| aerodigestive-program | aerodigestive + pediatric | 30 | program |
| pediatric-airway-stenosis | laryngotracheal/subglottic stenosis + pediatric | 30 | airway, stenosis |
| tracheomalacia-pediatric | tracheomalacia/bronchomalacia + pediatric | 25 | airway, tracheomalacia |
| laryngomalacia | laryngomalacia + pediatric | 25 | airway, laryngomalacia |
| tracheoesophageal-fistula | TEF/EA + pediatric | 25 | esophagus, EA-TEF |
| eoe-pediatric | eosinophilic esophagitis + pediatric | 25 | esophagus, EoE |
| swallowing-pediatric | FEES/videofluoroscopy/dysphagia + pediatric | 25 | swallowing |
| post-intubation-injury | post-intubation/CALI + pediatric | 20 | airway, intubation |
| ai-pediatric-airway | AI/ML/DL + pediatric airway | 20 | ai, frontier |

### Trigger manual (debug)

```bash
cd aerodig-backend
DRY_RUN=true python -m jobs.pubmed_daily
# DRY_RUN=true pula escrita no Firestore
```

---

## Score de Relevância (`services/relevance_score.py`)

Score em `[0, 1]` combinando 4 fatores com pesos:

```
score = 0.35 × journal_tier + 0.20 × recency + 0.25 × keyword + 0.20 × mesh
```

### Fatores

**Journal Tier** (`JOURNAL_TIER` dict):
- 1.00: IJPO, JAMA Oto-HNS
- 0.95: Laryngoscope, Laryngoscope Invest Oto
- 0.90: Oto-HNS, J Ped Surg
- 0.85: Ann Otol Rhinol Laryngol, Pediatrics, J Ped Gastro Nutr
- 0.80: Eur Arch ORL, Ped Pulmonol
- 0.50: default (revista não listada)
- 0.40: sem journal

**Recency** (ano publicação → hoje):
- ≤ 90 dias → 1.0
- ≤ 365 dias → 0.85
- ≤ 730 dias → 0.6
- Mais antigo → 0.3

**Keyword Density** (17 termos-chave no abstract+title):
- `aerodigestive`, `pediatric airway`, `laryngotracheal`, `subglottic stenosis`, `tracheoesophageal`, `tracheomalacia`, `laryngomalacia`, `laryngeal cleft`, `vocal fold paralysis`, `esophageal atresia`, `eosinophilic esophagitis`, `fees`, `videofluoroscopy`, `supraglottoplasty`, `slide tracheoplasty`, `cricotracheal resection`, `post-intubation`, `extubation laryngitis`
- Saturação suave: `min(1.0, hits / 4.0)`

**MeSH Match** (11 descritores prioritários):
- `Airway Obstruction`, `Larynx`, `Trachea`, `Deglutition Disorders`, `Laryngostenosis`, `Tracheal Stenosis`, `Esophageal Atresia`, `Tracheoesophageal Fistula`, `Vocal Cord Paralysis`, `Laryngomalacia`, `Eosinophilic Esophagitis`
- Saturação: `min(1.0, hits / 3.0)`

**Threshold:** `score >= 0.4` para entrar no pipeline de sumarização.

---

## Ledger de Confiança

Todo verbete carrega `confidence` (`high` | `moderate` | `low`) + `confidence_rationale` (frase curta).

### Critérios

| Nível | Critério | Exemplos |
|-------|---------|----------|
| 🟢 **high** | ≥ 1 diretriz internacional vigente OU consenso publicado OU ≥ 3 estudos convergentes tier 1, com validação pediátrica | Myer-Cotton, Benjamin-Inglis, PEDI-EAT-10, supraglotoplastia |
| 🟡 **moderate** | Estudos sólidos mas heterogêneos OU adoção em centros sem consenso multicêntrico OU validação em consolidação | Tracheopexy posterior, I-SEE EoE, splints 3D |
| 🔴 **low** | Nomenclatura emergente OU série única OU sem validação pediátrica robusta | Engenharia tecidual traqueal, IA laringoscopia pediátrica |

### Visualização

`<ConfidenceBadge level={confidence} rationale={confidence_rationale} />`

Cores: verde (`high`) / âmbar (`moderate`) / vermelho (`low`). Hover mostra rationale.

---

## Content Loader (`services/content_loader.py`)

Lê JSONs canônicos da pasta `seeds/` e valida com Pydantic.

### Dois padrões de loading

| Padrão | Função | Entities |
|--------|--------|----------|
| **_load_dir(subdir, Model)** | Lê `seeds/{subdir}/*.json` — 1 arquivo por entity | `Condition` (9 arquivos) |
| **_load_file(filename, Model)** | Lê `seeds/{filename}` — array JSON no topo | Todos os outros (Pathway, Instrument, Procedure, Calculator, Frontier, NetworkNode, NewsItem, Event) |

### Fluxo

```
seeds/*.json → json.load() → Model.model_validate(raw) → list[T]
```

**`use_local_seeds()`**: quando `USE_LOCAL_SEEDS=true` (default dev), routers leem diretamente dos JSONs, sem Firestore.

### Seeds canônicos (9 condições)

| Slug | Condição | Domain |
|------|---------|--------|
| `laringomalacia` | Laringomalácia | larynx |
| `estenose-subglotica` | Estenose subglótica | larynx |
| `fenda-laringea` | Fenda laríngea | larynx |
| `lesao-pos-intubacao` | Lesão pós-intubação (CALI) | larynx |
| `traqueomalacia` | Traqueomalácia | trachea |
| `estenose-traqueal-congenita` | Estenose traqueal congênita (anéis completos) | trachea |
| `atresia-esofago-fte` | Atresia de esôfago / FTE | esophagus |
| `eoe-drge-saos-pediatrico` | EoE + DRGE + SAOS pediátrico | esophagus |
| `disfagia-aspiracao` | Disfagia e aspiração | swallowing |

---

## Calculadoras Clínicas (`seeds/calculators.json`)

### 1. Conversor de Cânulas de Traqueostomia

- **Slug:** `tracheostomy-tube-converter`
- **Propósito:** Conversão entre marcas (Shiley NEO/PED/adulto, Bivona, Tracoe Biesalski, Portex, Rusch, Jackson metálica)
- **Inputs:** marca, tamanho declarado
- **Outputs:** DI (mm), DE (mm), French (Fr), faixa etária, equivalentes
- **Reference table:** 33 linhas de equivalência
- **Confiança:** moderate (variações entre lotes/modelos)
- **Fórmula:** `French ≈ DE(mm) × 3`

### 2. Calculadora Myer-Cotton (Estenose Subglótica)

- **Slug:** `myer-cotton-calc`
- **Propósito:** Estima grau de estenose subglótica (I–IV) a partir do tubo endotraqueal sem cuff que passa sem vazamento
- **Inputs:** faixa etária (determina tubo esperado), tubo OT sem cuff observado (mm DI)
- **Outputs:** grau de estenose, % redução da área transversal
- **Fórmula:** `Reduction% = [1 - (observado/esperado)²] × 100`
  - Grau I: ≤ 50% | Grau II: 51–70% | Grau III: 71–99% | Grau IV: sem lúmen
- **Reference table:** 7 faixas etárias com tubo esperado
- **Confiança:** high (Myer, O'Connor, Cotton 1994, PMID 8109626)

### 3. PEDI-EAT-10 (Calculadora de Disfagia)

- **Slug:** `pedi-eat-10-calc`
- **Propósito:** Versão interativa do questionário PEDI-EAT-10 (10 itens, 0–4)
- **Inputs:** 10 itens (engasgo, tosse, voz molhada, recusa alimentar, pneumonia recorrente, etc.)
- **Outputs:** pontuação total, interpretação
- **Fórmula:** soma simples i1..i10. ≤ 3 normal/limítrofe; > 3 = sintomatologia significativa
- **Confiança:** high (validado em múltiplos idiomas, tradução PT-BR disponível)

---

## LLM Service (`services/llm.py`)

Gera resumo PT-BR de 3 linhas para news items:
1. O que o estudo investigou
2. Principal achado
3. Implicação clínica para cuidado aerodigestivo pediátrico

**Providers:** DeepSeek-chat (preferred, `DEEPSEEK_API_KEY`) → Groq llama-3.1-8b-instant (fallback, `GROQ_API_KEY`)

**Config:** `temperature=0.2`, `max_tokens=280`

---

## Firebase & Firestore

### Inicialização (`firebase_db.py`)

- `_init_app()`: inicializa via `FIREBASE_SERVICE_ACCOUNT_JSON` (JSON inline)
- `get_db()`: retorna Firestore client (singleton) — `None` em dev sem credenciais
- `verify_token(id_token)`: valida Firebase ID token → decoded dict
- `is_curator(decoded)`: custom claim `role == 'curator'`

### Coleções Firestore

| Coleção | Conteúdo |
|---------|---------|
| `conditions/` | Verbetes do Atlas (sync de seeds) |
| `pathways/` | Fluxos de decisão |
| `instruments/` | Escalas e scores |
| `procedures/` | Procedimentos com outcome sets |
| `frontier/` | Radar de fronteira |
| `network_nodes/` | Centros e especialistas |
| `news_items/` | Artigos curados pelo pipeline PubMed |
| `events/` | Congressos e cursos |
| `audit_log/` | Log de auditoria |

### Seeds → Firestore sync

```bash
python scripts/seed-firestore.py  # produção apenas
```

JSON (`seeds/`) é fonte canônica versionada em git; Firestore é réplica operacional.

---

## Deploy

### Backend — Render (`render.yaml`)

```yaml
services:
  - type: web
    name: otto-aerodig-api
    runtime: python
    rootDir: aerodig-backend
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
    healthCheckPath: /health

  - type: cron
    name: otto-aerodig-pubmed-daily
    schedule: "0 9 * * *"   # 06:00 BRT = 09:00 UTC
    startCommand: python -m jobs.pubmed_daily
```

**URL prod backend:** `https://otto-aerodig-api.onrender.com`

### Frontend — Vercel

- **URL prod:** `https://otto-aerodig.vercel.app`
- SPA rewrite: `/(.*) → /index.html`
- Build: `tsc -b && vite build` → `dist/`

---

## Variáveis de Ambiente

### Frontend (`.env.local`)

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_API_URL=http://localhost:8003         # vazio para STATIC_MODE
```

### Backend (`.env`)

```
FIREBASE_SERVICE_ACCOUNT_JSON=             # JSON inline do service account
FRONTEND_URL=http://localhost:5176         # prod: https://otto-aerodig.vercel.app
DEEPSEEK_API_KEY=                          # LLM para resumos PT-BR (preferido)
GROQ_API_KEY=                              # fallback se DEEPSEEK ausente
PUBMED_API_KEY=                            # opcional, aumenta rate limit NCBI
PUBMED_EMAIL=noreply@drdariohart.com       # boa prática NCBI
NEWS_CRON_SECRET=                          # token para autorizar cron job
USE_LOCAL_SEEDS=true                       # dev: lê JSONs locais em vez de Firestore
```

---

## Convenções

| Item | Valor |
|------|-------|
| Design tokens Tailwind | `otto-*` (compartilhados PWA) + `aerodig-*` (locais) |
| Idioma | PT-BR primário, EN para termos clínicos consolidados (em `<i>`) |
| Slug | kebab-case (`laringomalacia`, `fenda-laringea`, `estenose-subglotica`) |
| ID Firestore | igual ao slug |
| Auth | Firebase Auth uid universal do ecossistema |
| Backend | lê do Firestore em prod; lê seeds JSON em dev |
| Embed PWA | iframe com CSP `frame-ancestors` |
| Domínio público | `otto-aerodig.vercel.app` |
| Repo GitHub | https://github.com/dhsig86/OTTO-AERODIG |

---

## Princípios Editoriais (não-negociáveis)

1. **Ledger de confiança** (`high` / `moderate` / `low`) em todo verbete.
2. **Separar padrão / variante / experimental** — não misturar.
3. **Outcome sets** obrigatórios em toda página de procedimento (decanulação, reintervenção, voz, deglutição, complicações, follow-up).
4. **Organizar por decisão**, não apenas por anatomia.
5. **Dados brasileiros** sempre que existirem; sinalizar quando faltarem.
6. **Não personalizar recomendação clínica** — hub é educacional.

---

## Taxonomia

### Domains

`larynx` | `trachea` | `esophagus` | `swallowing` | `sleep` | `genetic` | `vascular` | `general`

### Approach (Procedure)

`endoscopic` | `open` | `adjuvant` | `combined`

### Technology (Frontier)

`ai` | `3d_printing` | `genomics` | `bioabsorbable` | `biomarker` | `tissue_engineering`

### Maturity (Frontier)

`exploratory` | `translational` | `clinical_trial` | `approved_specialized` | `approved_widespread`

---

## Rotas Frontend

| Path | Componente | Dados |
|------|-----------|-------|
| `/` | `HomePage` | Dashboard home |
| `/atlas` | `AtlasPage` | Grid de condições |
| `/atlas/:slug` | `ConditionPage` | Detalhe da condição |
| `/pathways` | `PathwaysPage` | Lista de pathways |
| `/instruments` | `InstrumentsPage` | Lista de instrumentos |
| `/calculators` | `CalculatorsPage` | Lista de calculadoras |
| `/procedures` | `ProceduresPage` | Lista de procedimentos |
| `/frontier` | `FrontierPage` | Radar de fronteira |
| `/network` | `NetworkPage` | Mapa de rede |
| `/news` | `NewsPage` | Feed de news |
| `/events` | `EventsPage` | Calendário de eventos |
| `/search` | `SearchPage` | Busca cross-camadas |
| `*` | `NotFoundPage` | 404 |

---

## Próximos Passos

1. **Sprint 1:** Validar e enriquecer 9 condições seed com fontes da pasta AERODIGESTIVE BOOKS AND ARTICLES.
2. **Sprint 2:** Cron Render rodando + admin de curadoria + primeira leva de 50 news curadas.
3. **Sprint 3:** Scrapers de eventos + calendário público.
4. **Sprint 4:** Embed no PWA (`mapa_modulos.md` + tile + profile gating).

Detalhes em [PLAN.md](./PLAN.md).

---

## Comandos git no Cowork

⚠️ Push **não funciona** dentro do bash do Cowork (sem credenciais).
Após Claude commitar localmente, rodar no PowerShell Windows:

```powershell
cd "C:\Users\drdhs\OneDrive\Documentos\AOTTO ECOSYSTEM\OTTO AERODIG"
git push origin main
```
