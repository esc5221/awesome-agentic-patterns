#!/bin/bash
# 변환 안 된 패턴 목록 출력

cd "$(dirname "$0")/.."

for md in patterns/*.md; do
  [ "$md" = "patterns/TEMPLATE.md" ] && continue
  id=$(basename "$md" .md | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
  [ ! -d "pattern-snippets/patterns/$id" ] && echo "TODO: $md"
done
