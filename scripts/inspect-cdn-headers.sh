#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-http://localhost:3000}"

routes=(
  "/en"
  "/en?skim=1"
  "/en/experience"
  "/en/notes"
)

print_headers() {
  local url="$1"
  echo "== $url =="
  # -sS: silent but show errors, -D -: dump headers to stdout, -o /dev/null: discard body
  curl -sS -D - -o /dev/null "$url" | \
    awk 'BEGIN{IGNORECASE=1} /^(cache-control|content-type|etag|last-modified|vary|x-nextjs-cache|x-vercel-cache|age|server):/'
  echo
}

for route in "${routes[@]}"; do
  print_headers "${BASE_URL}${route}"
done
