#!/usr/bin/env bash
set -euo pipefail
deploy_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
project_dir="$(dirname -- "$deploy_dir")"
exec docker compose --project-directory "$project_dir" \
  --env-file "$deploy_dir/.env" -f "$project_dir/compose.production.yaml" "$@"
