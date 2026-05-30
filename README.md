# 🫁 OTTO Aerodigestive Hub

**Hub clínico-editorial brasileiro de medicina aerodigestiva pediátrica** — laringe, traqueia, esôfago, deglutição, sono e crescimento abordados como um sistema único, conforme o consenso internacional do campo.

Módulo do **OTTO Ecosystem** ([otto-pwa](https://github.com/dhsig86/OTTOPWA)).

> ⚠️ **Uso educacional.** Este hub não substitui avaliação médica individualizada. Conteúdo curado por especialista, com ledger de confiança explícito em cada verbete.

---

## 🎯 Proposta Clínica

A medicina aerodigestiva pediátrica é uma subespecialidade que reconhece a interdependência funcional entre as vias aérea e digestiva no paciente pediátrico. Crianças com condições aerodigestivas complexas — como estenose subglótica, laringomalácia grave, atresia de esôfago e esofagite eosinofílica — frequentemente requerem abordagem multidisciplinar (ORL + pneumopediatria + gastroenterologia + fonoaudiologia).

O **OTTO Aerodigestive Hub** foi projetado para ser o **sistema operacional clínico-editorial** que o médico brasileiro precisa para:

1. **Consultar verbetes curados** sobre condições aerodigestivas, organizados por decisão clínica (não apenas por anatomia)
2. **Acompanhar a literatura** com pipeline diário do PubMed + resumos em português
3. **Usar calculadoras clínicas** validadas (Myer-Cotton, PEDI-EAT-10, conversor de cânulas)
4. **Navegar fluxos de decisão** por sintoma (estridor pós-extubação, aspiração crônica, etc.)
5. **Conhecer o radar de fronteira** (IA, impressão 3D, genômica, biomarcadores) — separado do padrão de cuidado

Todo conteúdo carrega um **ledger de confiança** (🟢 alta / 🟡 moderada / 🔴 baixa) com justificativa rastreável.

---

## 📋 Condições Cobertas (Atlas v0.1)

O atlas inicial cobre **9 condições** organizadas em 4 domínios:

### 🫁 Laringe

| Condição | Confiança | Classificações |
|----------|-----------|---------------|
| **Laringomalácia** | 🟢 Alta | Olney, Shah, Groningen |
| **Estenose subglótica** | 🟢 Alta | Myer-Cotton (I–IV), ELS |
| **Fenda laríngea** | 🟢 Alta | Benjamin-Inglis (I–IV) |
| **Lesão pós-intubação (CALI)** | 🟢 Alta | CALI Scale |

### 🔵 Traqueia

| Condição | Confiança | Destaques |
|----------|-----------|-----------|
| **Traqueomalácia** | 🟢 Alta | Tipos I–III, tracheopexy, aortopexia |
| **Estenose traqueal congênita** (anéis completos) | 🟢 Alta | Slide tracheoplasty |

### 🟠 Esôfago

| Condição | Confiança | Destaques |
|----------|-----------|-----------|
| **Atresia de esôfago / FTE** | 🟢 Alta | Classificação de Gross, Foker, ESPGHAN |
| **EoE + DRGE + SAOS pediátrico** | 🟢 Alta | EREFS, I-GERQ-R, PSQ (PT-BR validado) |

### 🟣 Deglutição

| Condição | Confiança | Destaques |
|----------|-----------|-----------|
| **Disfagia e aspiração** | 🟢 Alta | FEES, VFSS, PEDI-EAT-10 |

---

## 🧮 Calculadoras Clínicas

| Calculadora | Domínio | O que faz |
|------------|---------|-----------|
| **Myer-Cotton** | Via aérea | Grau de estenose subglótica (I–IV) a partir do tubo OT sem cuff |
| **PEDI-EAT-10** | Deglutição | Questionário de 10 itens para disfagia pediátrica (corte > 3) |
| **Conversor de Cânulas** | Traqueostomia | Equivalência entre Shiley, Bivona, Tracoe, Portex, Rusch e Jackson |

---

## 🏗️ 8 Camadas do Hub

| Camada | O que entrega | Rota |
|--------|--------------|------|
| **Atlas** de condições | Verbetes curados com classificações, red flags, epidemiologia | `/atlas` |
| **Pathways** de decisão | Fluxos por sintoma (estridor, aspiração, disfagia) | `/pathways` |
| **Instrumentos** | PEDI-EAT-10, PSQ, EREFS, Myer-Cotton, Benjamin-Inglis, CALI | `/instruments` |
| **Calculadoras** | Calculadoras interativas com referência e interpretação | `/calculators` |
| **Procedimentos** | Supraglotoplastia, LTR, PCTR, slide tracheoplasty + outcome sets | `/procedures` |
| **Radar de Fronteira** | IA, impressão 3D, genômica, biomarcadores | `/frontier` |
| **Mapa de Rede** | Centros e especialistas BR/internacional | `/network` |
| **News** | Pipeline diário PubMed + resumo PT-BR + relevance score | `/news` |
| **Eventos** | Congressos, cursos e fellowships | `/events` |

---

## 🛡️ Ledger de Confiança

Cada verbete exibe um **badge de confiança** com justificativa:

| Nível | Critério | Badge |
|-------|---------|-------|
| 🟢 **Alta** | Diretriz internacional vigente OU consenso publicado OU ≥ 3 estudos convergentes + validação pediátrica | Verde |
| 🟡 **Moderada** | Estudos sólidos mas heterogêneos OU adoção em centros sem consenso multicêntrico | Âmbar |
| 🔴 **Baixa** | Nomenclatura emergente OU série única OU sem validação pediátrica robusta | Vermelho |

Hover sobre o badge mostra a justificativa (campo `confidence_rationale`).

---

## 📰 Pipeline de News (PubMed Daily)

O hub mantém um feed atualizado automaticamente:

1. **06:00 BRT** — Cron Render busca artigos dos últimos 14 dias no PubMed (8 queries configuradas)
2. **Score de relevância** — Cada artigo recebe nota [0–1] baseada em: tier da revista (35%), recência (20%), keywords aerodigestivas (25%) e termos MeSH (20%)
3. **Filtro** — Apenas artigos com score ≥ 0.4 passam
4. **Resumo PT-BR** — LLM gera 3 linhas: o que investigou, principal achado, implicação clínica
5. **Curadoria** — Artigos entram como `pending`; curador aprova para publicação

---

## ⚡ Stack

| Camada | Tecnologia | Hospedagem |
|--------|-----------|-----------|
| Frontend | React 18 + TypeScript + Vite + Tailwind | Vercel (`otto-aerodig.vercel.app`) |
| Backend | FastAPI (Python 3.11+) | Render (`otto-aerodig-api.onrender.com`) |
| Auth | Firebase Auth (Google SSO) | Firebase (`otto-ecosystem`) |
| Dados | Firestore + seeds JSON (versionados em git) | Firebase |
| Pipeline News | Cron Render + PubMed E-utilities + DeepSeek/Groq | Render |
| Testes | vitest (frontend) + pytest (backend) + GitHub Actions | CI |

---

## 📂 Estrutura

```
OTTO AERODIG/
├── aerodig-backend/     FastAPI → Render (porta dev: 8003)
│   ├── routers/         11 routers (conditions, pathways, instruments, procedures,
│   │                    calculators, frontier, network, news, events, search, jobs)
│   ├── services/        pubmed, llm, relevance_score, content_loader
│   ├── jobs/            pubmed_daily (cron)
│   ├── models/          Pydantic schemas
│   ├── seeds/           JSONs canônicos (fonte de verdade)
│   └── tests/           11 arquivos pytest
├── aerodig-frontend/    React+TS+Vite → Vercel (porta dev: 5176)
│   ├── src/pages/       13 páginas
│   ├── src/components/  Layout, Sidebar, ConfidenceBadge, etc.
│   ├── src/services/    firebase.ts, api.ts
│   ├── src/hooks/       useAuth.ts
│   ├── src/types/       content.ts (espelha backend schemas)
│   └── src/tests/       12 arquivos vitest
├── docs/                Contratos e modelos editoriais
├── ARCHITECTURE.md      ADRs + topologia
├── CLAUDE.md            Contexto para LLMs
└── README.md            ← este arquivo
```

Detalhes técnicos em [ARCHITECTURE.md](./ARCHITECTURE.md) e [CLAUDE.md](./CLAUDE.md).

---

## 🚀 Como Rodar Localmente

### Pré-requisitos

- Python 3.11+
- Node.js 18+
- Conta Firebase (projeto `otto-ecosystem`)

### Backend

```bash
cd aerodig-backend
python -m venv venv
# Windows: venv\Scripts\activate
source venv/bin/activate
pip install -r requirements.txt

# Configurar variáveis de ambiente
cp .env.example .env
# Preencher: FIREBASE_SERVICE_ACCOUNT_JSON, DEEPSEEK_API_KEY (ou GROQ_API_KEY)

# Iniciar servidor
uvicorn main:app --reload --port 8003
# → http://localhost:8003/health
# → http://localhost:8003/docs    (Swagger UI)
```

### Frontend

```bash
cd aerodig-frontend
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Preencher: VITE_FIREBASE_* + VITE_API_URL=http://localhost:8003

# Iniciar dev server
npm run dev
# → http://localhost:5176
```

> **Modo estático:** Se `VITE_API_URL` estiver vazio, o frontend opera sem backend, lendo JSONs estáticos de `public/data/`. Útil para demonstrações rápidas.

### Testes

```bash
# Backend
cd aerodig-backend && pytest -q

# Frontend
cd aerodig-frontend && npm run test:run && npm run typecheck
```

---

## 🌐 Deploy

| Componente | Plataforma | URL |
|-----------|-----------|-----|
| Frontend | Vercel | `https://otto-aerodig.vercel.app` |
| Backend API | Render (web) | `https://otto-aerodig-api.onrender.com` |
| Cron PubMed | Render (cron) | Executa diariamente 06:00 BRT |

CI roda em GitHub Actions: `pytest` + `ruff` (backend) e `vitest` + `tsc` + `eslint` (frontend).
Pull request bloqueado se algum check falha.

---

## 🔐 Segurança

- **CORS:** Allowlist explícita (NUNCA wildcard `*` com credentials)
- **CSP:** `frame-ancestors` com origens específicas (iframe seguro no PWA)
- **Auth:** Firebase Auth com Google SSO, uid do token verificado
- **Curadoria:** Custom claim `role='curator'` para aprovar/rejeitar news
- **Cron:** Secret token no header `X-Cron-Secret`
- **LGPD:** Sem persistência de PII não necessária

---

## 📊 Status

`v0.1` — Scaffold completo com 9 condições, 3 calculadoras, pipeline PubMed configurado.

Próximas sprints: enriquecer verbetes com fontes da literatura, ativar cron Render, admin de curadoria, embed no PWA.

Ver [PLAN.md](./PLAN.md) para roadmap detalhado.

---

## 📜 Licença

Privado — Dr. Dario Hart Signorini / OTTO Ecosystem.
