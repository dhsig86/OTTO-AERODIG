# News Pipeline

Documentação operacional do cron diário do Aerodigestive Hub.

## Visão geral

```
06:00 BRT (Render Cron)
    ↓
POST /api/jobs/pubmed-daily   (header X-Cron-Secret)
    ↓
ESearch (PubMed) por cada query em seeds/pubmed-queries.json
    ↓
EFetch metadados estruturados (XML → dict)
    ↓
relevance_score.score(article)  →  float [0, 1]
    ↓
filtra score >= 0.4
    ↓
llm.summarize_ptbr(title, abstract, journal, year)  →  3 linhas PT-BR
    ↓
Firestore.news_items.set(doc_id, status='pending')
    ↓
Curador no /admin (futuro Sprint 2):  approve | reject
    ↓
Frontend exibe em /news quando status='published'
```

## Componentes

| Arquivo | Função |
|---|---|
| `aerodig-backend/services/pubmed.py` | ESearch + EFetch + parser XML |
| `aerodig-backend/services/relevance_score.py` | Score em [0, 1] (journal IF + recency + keyword + MeSH) |
| `aerodig-backend/services/llm.py` | DeepSeek (preferred) / Groq fallback |
| `aerodig-backend/jobs/pubmed_daily.py` | Orquestração + persistência Firestore |
| `aerodig-backend/routers/jobs.py` | Endpoint HTTP autenticado por secret |

## Variáveis de ambiente

| Var | Obrigatório | Descrição |
|---|---|---|
| `PUBMED_API_KEY` | não (mas recomendado) | Aumenta rate limit NCBI |
| `PUBMED_EMAIL` | sim | Boa prática NCBI |
| `DEEPSEEK_API_KEY` | sim | LLM para resumos PT-BR |
| `GROQ_API_KEY` | fallback | Se DEEPSEEK não configurado |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | sim em prod | Persistência |
| `NEWS_CRON_SECRET` | sim em prod | Token Bearer no header X-Cron-Secret |

## Threshold

`score >= 0.4` é o corte default. Pesos:

```
0.35 * journal_tier
0.20 * recency
0.25 * keyword_density
0.20 * mesh_match
```

Ajustar em `services/relevance_score.py`.

## Reprocessamento

PMID já existente em `news_items` recebe `set(merge=True)` — atualiza score e tags
mas preserva curadoria humana.

## Trigger manual (debug)

```bash
cd aerodig-backend
DRY_RUN=true python -m jobs.pubmed_daily
```

`DRY_RUN=true` pula a escrita no Firestore (útil para validar pipeline em dev).
