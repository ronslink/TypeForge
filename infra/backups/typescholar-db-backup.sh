#!/usr/bin/env bash
#
# TypeForge EU — nightly logical backup of typeforge_eu.
#
# This is the script deployed at /usr/local/sbin/backup-typescholar-db.sh on the
# backup host, kept here so it is reviewable and restorable. It is NOT run from
# the repository; it is installed on the host and driven by cron:
#
#   /etc/cron.d/typescholar-db-backup
#   17 2 * * * root /usr/local/sbin/backup-typescholar-db.sh >/var/log/typescholar-db-backup.log 2>&1
#
# Rewritten on 2026-10-04, after 2 and 3 Oct produced 0-byte ".dump" files that
# were indistinguishable from real backups. Three properties this version exists
# to guarantee:
#
#   1. A failed dump never leaves an artifact resembling a good backup. The
#      archive is written to a staging path and only moved into place once it has
#      been read back and size-checked.
#   2. Every run states what happened. The previous version printed nothing on
#      success, so an empty log could equally mean "worked" or "died silently" —
#      which is how two nights of missing backups went unnoticed.
#   3. A partial file cannot survive the run. The staging path is removed by an
#      EXIT trap on any exit, including a failure or a signal.
#
# The failure this was hiding is real: the Postgres cluster is down because the
# root filesystem filled on 2026-10-02. Until that is resolved this script
# correctly FAILS and says so, rather than quietly writing an empty file.

set -euo pipefail

backup_dir="${BACKUP_DIR:-/root/db-backups/typescholar}"
db_name="${DB_NAME:-typeforge_eu}"
retention_days="${RETENTION_DAYS:-14}"
# A real dump of this schema is ~478 KB. Anything near zero is a failure.
min_bytes="${MIN_BYTES:-10240}"

log() { printf '%s %s\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" "$*"; }

install -d -m 700 "$backup_dir"

out="$backup_dir/${db_name}_$(date -u +%Y%m%dT%H%M%SZ).dump"
staging="$backup_dir/.${db_name}.partial"
trap 'rm -f "$staging"' EXIT

log "start backup of ${db_name}"

# Written to the staging path, so an aborted dump cannot be mistaken for a
# finished one. pg_dump's stderr is left to the caller's redirect (cron logs it).
if ! sudo -u postgres pg_dump -Fc "$db_name" > "$staging"; then
    log "ERROR pg_dump failed for ${db_name}; no backup written"
    exit 1
fi

# Read the archive back. This proves it is a complete, parseable custom-format
# dump rather than a truncated file that merely exists with a plausible name.
if ! pg_restore -l "$staging" > /dev/null 2>&1; then
    log "ERROR dump is not a readable archive; refusing to keep it"
    exit 1
fi

bytes=$(wc -c < "$staging")
if [ "$bytes" -lt "$min_bytes" ]; then
    log "ERROR dump is only ${bytes} bytes (minimum ${min_bytes}); refusing to keep it"
    exit 1
fi

mv "$staging" "$out"
chmod 600 "$out"
trap - EXIT

log "OK backup written: ${out} (${bytes} bytes)"

# 14-day local retention. Only well-formed archives ever reach this point, so the
# glob cannot be confused by leftovers.
removed=$(find "$backup_dir" -type f -name "${db_name}_*.dump" -mtime +"$retention_days" -print -delete | wc -l)
log "retention: removed ${removed} archive(s) older than ${retention_days} days"
log "done"
