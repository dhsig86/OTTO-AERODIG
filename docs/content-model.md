# Content Model

Modelo de dados completo do OTTO Aerodigestive Hub. Espelha
[`aerodig-backend/models/schemas.py`](../aerodig-backend/models/schemas.py) e
[`aerodig-frontend/src/types/content.ts`](../aerodig-frontend/src/types/content.ts).

## Hierarquia

```
BaseEntity
├── Condition         (atlas)
├── Pathway           (fluxo de decisão)
├── Instrument        (escala/score)
├── Procedure         (intervenção)
├── FrontierItem      (radar de fronteira)
├── NetworkNode       (mapa de rede)
├── NewsItem          (artigo curado)
└── Event             (congresso/curso)
```

## Campos comuns (BaseEntity)

| Campo | Tipo | Obrigatório | Notas |
|---|---|---|---|
| `id` | string | sim | Igual ao slug (kebab-case) |
| `slug` | string | sim | Identificador URL-friendly |
| `title_pt` | string | sim | Título PT-BR primário |
| `title_en` | string | sim | Termo clínico EN consolidado |
| `audience` | enum | sim | `pediatric` (padrão MVP) / `adult` / `both` |
| `confidence` | enum | **sim** | `high` / `moderate` / `low` |
| `confidence_rationale` | string | **sim** | Justificativa em uma frase |
| `sources` | Source[] | sim | Mínimo 2 para verbete clínico |

## Source

```ts
{ title, authors?, journal?, year?, pmid?, doi?, url?, source_type? }
```

## Outcome Set (obrigatório em Procedure)

```ts
{ decannulation, reintervention, voice, swallow, complications, followup }
```

Todos os 6 campos devem aparecer (mesmo que com valor `null`) — o teste
`test_procedures.test_all_procedures_have_outcome_set` bloqueia regressão.

## Confidence ledger — guia editorial

| Nível | Quando usar |
|---|---|
| **high** | Diretriz internacional vigente OU consenso publicado OU múltiplos estudos primários convergentes E validação pediátrica explícita |
| **moderate** | Estudos sólidos mas heterogêneos OU adoção de centro de referência sem consenso multicêntrico OU validação pediátrica em consolidação |
| **low** | Nomenclatura emergente OU série única OU sem validação pediátrica robusta na literatura indexada rastreada |

## Como adicionar uma nova condição

1. Crie arquivo `aerodig-backend/seeds/conditions/<slug>.json` com o schema completo.
2. Rode `pytest tests/test_content_loader.py tests/test_conditions.py` — Pydantic valida.
3. Atualize cross-references em pathways/procedures/instruments se relevante.
4. Abra PR. Reviewer (Dario) confere fontes e ledger.
5. Após merge: rodar `python scripts/seed-firestore.py` em produção.

## Como adicionar um novo pathway, instrument, procedure, frontier, network node, event

Editar o array em `aerodig-backend/seeds/<arquivo>.json`. Mesmo fluxo de PR + revisão + sync.
