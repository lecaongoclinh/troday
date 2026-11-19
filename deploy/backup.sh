#!/usr/bin/env bash
set -euo pipefail
umask 077
deploy_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
project_dir="$(dirname -- "$deploy_dir")"
backup_dir="$project_dir/.cache/backups/$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p -- "$backup_dir"
dc() { bash "$deploy_dir/dc.sh" "$@"; }

# Pause writers so SQL and uploaded bytes belong to the same application state.
# The website will temporarily return 502 for API calls during this operation.
trap 'dc start be >&2' EXIT
dc stop be >&2
dc exec -T db sh -c \
  'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" exec mysqldump -u root --single-transaction --routines --triggers --events --no-tablespaces --set-gtid-purged=OFF --databases troday' \
  | gzip > "$backup_dir/database.sql.gz"
dc run --rm --no-deps -T --entrypoint tar be \
  -C /app/uploads -czf - . > "$backup_dir/uploads.tar.gz"
cp -- "$deploy_dir/.env" "$backup_dir/deploy.env"
printf 'Backup saved to %s\n' "$backup_dir"
