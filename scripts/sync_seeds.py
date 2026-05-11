#!/usr/bin/env python3
"""
sync_seeds.py
=============
Copia os seeds canônicos do frontend para o backend, mantendo as duas cópias
em sincronismo. Execute sempre que modificar arquivos em aerodig-frontend/public/data/.

Uso:
    python scripts/sync_seeds.py              # dry-run (mostra o que seria copiado)
    python scripts/sync_seeds.py --apply      # executa a cópia

A fonte da verdade é sempre o frontend:
    aerodig-frontend/public/data/   →   aerodig-backend/seeds/
"""

import argparse
import shutil
import sys
from pathlib import Path

# ── Caminhos ──────────────────────────────────────────────────────────────────
REPO_ROOT = Path(__file__).resolve().parent.parent
SRC = REPO_ROOT / "aerodig-frontend" / "public" / "data"
DST = REPO_ROOT / "aerodig-backend" / "seeds"


def sync(apply: bool) -> int:
    """Sincroniza SRC → DST. Retorna número de arquivos copiados/que seriam copiados."""
    if not SRC.exists():
        print(f"[ERRO] Diretório de origem não encontrado: {SRC}", file=sys.stderr)
        sys.exit(1)
    if not DST.exists():
        print(f"[ERRO] Diretório de destino não encontrado: {DST}", file=sys.stderr)
        sys.exit(1)

    copied = 0

    for src_file in sorted(SRC.rglob("*.json")):
        rel = src_file.relative_to(SRC)
        dst_file = DST / rel

        # Verificar se precisam sincronizar
        if dst_file.exists() and src_file.read_bytes() == dst_file.read_bytes():
            continue  # já idênticos

        if apply:
            dst_file.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src_file, dst_file)
            print(f"  copiado  {rel}")
        else:
            print(f"  pendente {rel}")

        copied += 1

    return copied


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Executa a cópia (sem esta flag o script apenas lista o que seria copiado)",
    )
    args = parser.parse_args()

    mode = "APLICANDO" if args.apply else "DRY-RUN"
    print(f"sync_seeds.py [{mode}]")
    print(f"  origem:  {SRC}")
    print(f"  destino: {DST}")
    print()

    n = sync(apply=args.apply)

    if n == 0:
        print("✓ Seeds já sincronizados — nenhuma diferença encontrada.")
    elif args.apply:
        print(f"\n✓ {n} arquivo(s) copiado(s) com sucesso.")
    else:
        print(f"\n{n} arquivo(s) aguardando sincronização. Execute com --apply para copiar.")
        sys.exit(1)  # exit code 1 em dry-run com diferenças (útil em CI)


if __name__ == "__main__":
    main()
