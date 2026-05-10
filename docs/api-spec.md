# API Spec

Backend FastAPI auto-documentado em `/docs` (Swagger UI) e `/redoc`.

## Rotas públicas

| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | Status básico |
| GET | `/api/conditions` | Lista verbetes do Atlas (param opcional `domain`) |
| GET | `/api/conditions/{slug}` | Detalhe do verbete |
| GET | `/api/pathways` | Lista pathways |
| GET | `/api/pathways/{slug}` | Detalhe |
| GET | `/api/instruments` | Lista instrumentos (param opcional `domain`) |
| GET | `/api/instruments/{slug}` | Detalhe |
| GET | `/api/procedures` | Lista procedimentos |
| GET | `/api/procedures/{slug}` | Detalhe |
| GET | `/api/frontier` | Lista itens de fronteira (param opcional `technology`) |
| GET | `/api/frontier/{slug}` | Detalhe |
| GET | `/api/network` | Lista nós da rede (params opcionais `country`, `node_type`) |
| GET | `/api/network/{slug}` | Detalhe |
| GET | `/api/news?status=published` | News publicadas (default) |
| GET | `/api/news/{slug}` | Detalhe |
| GET | `/api/events?upcoming=true` | Eventos futuros |
| GET | `/api/events/{slug}` | Detalhe |
| GET | `/api/search?q=...` | Busca textual cross-camadas |

## Rotas protegidas (cron)

| Método | Rota | Auth |
|---|---|---|
| POST | `/api/jobs/pubmed-daily` | Header `X-Cron-Secret` deve casar com `NEWS_CRON_SECRET` |

## Headers iframe (todos os endpoints)

```
X-Frame-Options: ALLOW-FROM https://otto.drdariohart.com
Content-Security-Policy: frame-ancestors 'self' https://otto.drdariohart.com https://ottopwa.vercel.app https://otto-aerodig.vercel.app
```
