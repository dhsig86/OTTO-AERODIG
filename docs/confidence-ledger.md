# Confidence Ledger — guia editorial

> O ledger de confiança é o ativo editorial mais valioso do OTTO Aerodigestive Hub.
> Ele diferencia consenso internacional de nomenclatura emergente. Sem ele, viramos
> mais um agregador de literatura.

## Os três níveis

### 🟢 Alta confiança

**Critério:** ≥ 1 dos abaixo, com validação pediátrica explícita:
- Diretriz internacional vigente (AAO-HNS, ELS, NASPGHAN/ESPGHAN, AAP)
- Consenso publicado (Aerodigestive Society 2018, ESPGHAN 2016 EA, etc)
- ≥ 3 estudos primários convergentes em revistas tier 1 do campo

**Exemplos:**
- Olney/Shah/Groningen para laringomalácia
- Benjamin-Inglis para fenda laríngea
- Myer-Cotton/ELS para estenose subglótica
- CALI para lesão pós-intubação
- PEDI-EAT-10, PSQ (PT-BR validado), EREFS, I-GERQ-R
- Slide tracheoplasty para anéis completos
- Supraglotoplastia para laringomalácia grave

### 🟡 Confiança moderada

**Critério:**
- Estudos sólidos mas heterogêneos
- Adoção em centros de referência mas sem consenso multicêntrico
- Validação pediátrica em consolidação
- Tradução PT-BR ainda pendente

**Exemplos:**
- Tracheopexy posterior (técnica em adoção)
- I-SEE para EoE (sistema integrado novo)
- OSA-18 (mede QoL, não rastreio diagnóstico)
- Splints 3D bioabsorvíveis (séries iniciais positivas)
- Exoma em via aérea complexa (yield variável entre estudos)

### 🔴 Baixa confiança

**Critério:**
- Nomenclatura emergente sem múltiplas referências indexadas
- Série única
- Sem validação pediátrica robusta na literatura rastreada

**Exemplos no MVP:**
- "Langeron" para laringomalácia (não emergiu robustamente nas bases)
- "pSBI", "iHOS", "TIMES" — nomenclaturas a verificar
- Engenharia tecidual traqueal (resultados clínicos conflitantes)
- IA aplicada à laringoscopia pediátrica (scoping review 2024 sem padrão consolidado)

## Como justificar (campo `confidence_rationale`)

Uma frase curta. Bons exemplos:

> "Padrão histórico universalmente referenciado."
>
> "Diretrizes pediátricas explícitas para EoE e DRGE; PSQ tem validação em português do Brasil."
>
> "Tecnologia promissora com séries iniciais; ainda altamente especializada."
>
> "Resultados conflitantes e questões éticas em casos publicados."

Maus exemplos a evitar:

> ❌ "Recomendado por especialistas." *(qual especialista? que recomendação?)*
>
> ❌ "Estudos mostram benefício." *(quais? em que população?)*

## Atualização

Sempre que uma nova diretriz for publicada ou uma classificação for substituída,
abrir PR atualizando o `confidence` E o `confidence_rationale` da entidade afetada.
O campo `updated_at` é atualizado automaticamente pelo `seed-firestore.py`.

## Visualização

Toda entidade exibe um badge `<ConfidenceBadge level={...} rationale={...} />`.
Cores:
- Alta → verde otto-light
- Moderada → âmbar aerodig-news/15
- Baixa → vermelho aerodig-flag/15

Hover sobre o badge mostra o rationale.
