#!/usr/bin/env bash
# desc: visão geral do repo numa chamada só (status, arquivos por extensão, commits recentes, maiores pastas)
# uso: ./ai run repo-overview [n_commits=5]
# Exemplo de script consolidado: substitui ~5 chamadas de ferramenta separadas.
set -u
n="${1:-5}"
echo "## git status"; git status --short | head -20
echo; echo "## arquivos por extensão (top 10)"
git ls-files --cached --others --exclude-standard | sed -n 's/.*\.\([A-Za-z0-9]*\)$/\1/p' | sort | uniq -c | sort -rn | head -10
echo; echo "## últimos $n commits"; git log --oneline -n "$n" 2>/dev/null || echo "(sem commits)"
echo; echo "## pastas com mais arquivos (top 8)"
git ls-files --cached --others --exclude-standard | awk -F/ 'NF>1{print $1}' | sort | uniq -c | sort -rn | head -8
