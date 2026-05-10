# OTTO Aerodigestive Hub

Hub clínico-editorial brasileiro de **medicina aerodigestiva pediátrica** — laringe, traqueia, esôfago, deglutição, sono e crescimento abordados como um sistema único, conforme o consenso internacional do campo.

Mais um módulo do **OTTO Ecosystem** ([otto-pwa](https://github.com/dhsig86/OTTOPWA)).

---

## Visão geral

O hub não é uma enciclopédia linear. É um **sistema operacional clínico-editorial** com 8 camadas conectadas:

| Camada | O que entrega |
|---|---|
| **Atlas** de condições | Verbetes curados (laringomalácia, fenda laríngea, LTS, EA/FTE, EoE pediátrica, …) |
| **Pathways** de decisão | Fluxos por sintoma (estridor pós-extubação, aspiração crônica, …) |
| **Instrumentos** | PEDI-EAT-10, PSQ, EREFS, Myer-Cotton, Benjamin-Inglis, CALI, … |
| **Procedimentos** | Supraglotoplastia, LTR, PCTR, slide tracheoplasty, aortopexia, … com outcome sets |
| **Radar de Fronteira** | IA, impressão 3D, genômica, biomarcadores — separado do padrão de cuidado |
| **Mapa de Rede** | Centros e especialistas BR/internacional |
| **News** | Pipeline diário PubMed + revistas-chave + resumo PT-BR |
| **Eventos** | Congressos, cursos e fellowships agregados |

Todo verbete carrega um **ledger de confiança** (alta / média / baixa) explícito.

---

## Stack

| Camada | Tecnologia | Hospedagem |
|---|---|---|
| Frontend | React 18 + TypeScript + Vite + Tailwind | Vercel |
| Backend | FastAPI (Python) | Render |
| Auth | Firebase Auth (Google) | — |
| Dados curatoriais | Firestore | — |
| Pipeline News | Cron Render + PubMed E-utilities + LLM | — |
| Testes | vitest + pytest + GitHub Actions | — |

---

## Estrutura

```
OTTO AERODIG/
├── aerodig-backend/     FastAPI → Render
├── aerodig-frontend/    React + Vite → Vercel
├── docs/                Contratos e modelos
├── scripts/             Bootstrap utilitários
└── PLAN.md              Plano completo (ULTRATHINK)
```

Detalhes em [PLAN.md](./PLAN.md) e [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## Como rodar localmente

### Backend
```bash
cd aerodig-backend
python -m venv venv
# Windows: venv\Scripts\activate
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # preencher Firebase + DEEPSEEK_API_KEY
uvicorn main:app --reload --port 8003
# → http://localhost:8003/health
# → http://localhost:8003/docs    (Swagger UI)
```

### Frontend
```bash
cd aerodig-frontend
npm install
cp .env.example .env.local   # preencher VITE_FIREBASE_* + VITE_API_URL=http://localhost:8003
npm run dev
# → http://localhost:5176
```

### Tests
```bash
# Backend
cd aerodig-backend
pytest -q

# Frontend
cd aerodig-frontend
npm run test:run
```

---

## Deploy

Frontend (Vercel) e backend (Render) são deploys independentes.
CI roda em GitHub Actions: `pytest` + `ruff` (backend) e `vitest` + `tsc` + `eslint` (frontend).
Pull request bloqueado se algum check falha.

---

## Status

`v0.1` — Scaffold inicial. Conteúdo será preenchido em sprints subsequentes (ver [PLAN.md §11](./PLAN.md)).

---

## Licença

Privado — Dr. Dario Hart / OTTO Ecosystem.
