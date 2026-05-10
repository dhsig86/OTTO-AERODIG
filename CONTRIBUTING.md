# Como contribuir

## Workflow

1. **Branch:** `feature/<escopo>-<descricao>` ou `fix/<descricao>`.
2. **Read antes de Edit:** sempre ler arquivos antes de modificar.
3. **Tests:** rodar `pytest` e `npm run test:run` antes de commitar. CI bloqueia PR se algum check falha.
4. **Conteúdo editorial:** novos verbetes vão em `aerodig-backend/seeds/` como JSON, nunca direto no Firestore. Re-rodar `scripts/seed-firestore.py` após merge.
5. **Commits semânticos:**
   - `feat(escopo): ...` nova funcionalidade
   - `fix(escopo): ...` correção
   - `refactor(escopo): ...` sem mudança comportamental
   - `docs(escopo): ...` apenas documentação
   - `content(escopo): ...` adição/edição de verbete
   - `chore(escopo): ...` config, deps

## Princípios editoriais

1. **Ledger de confiança obrigatório.** Todo verbete declara `confidence: high|moderate|low` com `confidence_rationale` em uma frase.
2. **Fontes citadas.** Mínimo 2 fontes (PMID/DOI/URL) por verbete clínico.
3. **Idioma.** PT-BR primário; termos clínicos em EN dentro de `<i>` quando consolidados internacionalmente.
4. **Não-personalização clínica.** Conteúdo educacional. Nunca prescritivo individual.

## Testes obrigatórios para novos endpoints

Backend: cobrir 200, 404, schema, autenticação (se aplicável).
Frontend: render, interação principal, estado de erro.

## Code review

- 1 reviewer (Dario) para todo PR.
- Checklist: tests verdes, ledger preenchido em conteúdo novo, sem secrets.
