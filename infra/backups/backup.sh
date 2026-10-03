#!/bin/bash
# TypeForge — Database Backup Script
# Daily pg_dump → compress → upload to R2
#
# Two failure modes this script exists to prevent, both of which happened in
# production: a dump that fails must never leave a file that looks like a
# successful backup, and the upload must never be attempted with an empty one.
#
# `set -o pipefail` is load-bearing. Without it `pg_dump ... | gzip` reports
# gzip's exit status, so a failed dump looked like a success: the script logged
# "Backup created", uploaded a 0-byte file, and deleted the local copy.

set -euo pipefail

# Configuration
REGION="${REGION:-eu}"
DB_NAME="${DB_NAME:-typeforge_${REGION}}"
DB_USER="${DB_USER:-typeforge_admin}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/typeforge}"
R2_BUCKET="typeforge-backups"
R2_REMOTE="${R2_BUCKET}/${REGION}"
RETENTION_DAYS=30
# A real dump of this schema is hundreds of KB; anything smaller is a failure.
MIN_BYTES="${MIN_BYTES:-1024}"

# Timestamp
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${DATE}.sql.gz"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
}

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Create backup
#
# Written to a staging path and moved into place only once it is known to be a
# complete, non-empty archive. A partial dump therefore never appears under the
# name a restore would look for.
log_info "Starting backup for ${DB_NAME}..."
STAGING_FILE="${BACKUP_FILE}.partial"
trap 'rm -f "$STAGING_FILE"' EXIT

if ! pg_dump -U "$DB_USER" -d "$DB_NAME" --format=plain --no-owner --no-acl | gzip > "$STAGING_FILE"; then
    log_error "pg_dump failed for ${DB_NAME}; no backup written"
    exit 1
fi

# `gzip -t` catches a truncated or corrupt archive, which a byte-count check alone
# would let through.
if ! gzip -t "$STAGING_FILE"; then
    log_error "Backup archive is corrupt: ${STAGING_FILE}"
    exit 1
fi

STAGED_BYTES=$(wc -c < "$STAGING_FILE")
if [ "$STAGED_BYTES" -lt "$MIN_BYTES" ]; then
    log_error "Backup is suspiciously small (${STAGED_BYTES} bytes, minimum ${MIN_BYTES}); refusing to keep it"
    exit 1
fi

mv "$STAGING_FILE" "$BACKUP_FILE"
trap - EXIT
log_info "Backup created: ${BACKUP_FILE} (${STAGED_BYTES} bytes)"

# Upload to R2. The local file is kept until the upload is known to have
# succeeded, so a transfer failure cannot cost us the only copy.
log_info "Uploading to R2..."
if ! rclone copy "$BACKUP_FILE" "$R2_REMOTE/"; then
    log_error "Upload failed; local backup retained at ${BACKUP_FILE}"
    exit 1
fi
log_info "Upload complete"

# Clean up old backups (retention)
log_info "Cleaning up old backups (older than ${RETENTION_DAYS} days)..."
rclone delete "$R2_REMOTE/" --min-age "${RETENTION_DAYS}d"

log_info "Backup completed successfully!"

# Send notification (optional).
#
# `${WEBHOOK_URL:-}` matters because of `set -u`: an unset variable would
# otherwise abort the script *after* a successful backup, reporting failure for
# work that actually succeeded.
if [ -n "${WEBHOOK_URL:-}" ]; then
    curl -fsS -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{\"text\": \"TypeForge ${REGION} backup completed: ${DATE}\"}" \
        || log_error "Backup succeeded but the notification webhook failed"
fi
