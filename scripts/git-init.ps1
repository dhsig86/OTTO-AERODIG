# OTTO Aerodigestive Hub — script de inicialização git
# Rodar no PowerShell Windows após o scaffold inicial:
#   cd "C:\Users\drdhs\OneDrive\Documentos\AOTTO ECOSYSTEM\OTTO AERODIG"
#   .\scripts\git-init.ps1

$ErrorActionPreference = 'Stop'

# 1. Garante que estamos na pasta correta
$Repo = "C:\Users\drdhs\OneDrive\Documentos\AOTTO ECOSYSTEM\OTTO AERODIG"
Set-Location -Path $Repo

# 2. git init (se ainda não houver .git)
if (-not (Test-Path ".git")) {
    git init
    git branch -M main
}

# 3. Stage + commit inicial
git add .
git status

$msg = @"
feat(scaffold): OTTO Aerodigestive Hub — estrutura inicial v0.1

- Backend FastAPI + Render (routers: conditions, pathways, instruments, procedures, frontier, network, news, events, search, jobs)
- Frontend React+TS+Vite+Tailwind + Vercel (11 paginas)
- 9 condicoes seed + 12 instrumentos + 8 procedimentos + 6 frontier + 7 network + 3 pathways + 5 eventos + 9 queries PubMed
- Pipeline News (PubMed E-utilities + LLM resumo PT-BR + relevance scoring)
- Pipeline Eventos (5 sociedades + entrada manual)
- Tests: pytest (backend, 39 verdes) + vitest (frontend) + GitHub Actions CI
- Documentacao: PLAN.md (ULTRATHINK), ARCHITECTURE.md, README.md, CLAUDE.md, CONTRIBUTING.md
"@

git commit -m $msg

# 4. Configura remote e push
$remote = "https://github.com/dhsig86/OTTO-AERODIG.git"
$existingRemote = git remote get-url origin 2>$null
if (-not $existingRemote) {
    git remote add origin $remote
}

Write-Host ""
Write-Host "===================================================================" -ForegroundColor Green
Write-Host " Scaffold local commitado." -ForegroundColor Green
Write-Host " Para publicar:" -ForegroundColor Green
Write-Host "   git push -u origin main" -ForegroundColor Yellow
Write-Host "===================================================================" -ForegroundColor Green
