#!/bin/bash
# TypeForge — Database Backup Script
# Daily pg_dump → compress → upload to R2

set -e

# Configuration
REGION="${REGION:-eu}"
DB_NAME="typeforge_${REGION}"
DB_USER="${DB_USER:-typeforge_admin}"
BACKUP_DIR="/tmp/typeforge-backups"
R2_BUCKET="typeforge-backups"
R2_REMOTE="${R2_BUCKET}/${REGION}"
RETENTION_DAYS=30

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
log_info "Starting backup for ${DB_NAME}..."
if pg_dump -U "$DB_USER" -d "$DB_NAME" --format=plain --no-owner --no-acl | gzip > "$BACKUP_FILE"; then
    log_info "Backup created: ${BACKUP_FILE}"
else
    log_error "Backup failed!"
    exit 1
fi

# Upload to R2
log_info "Uploading to R2..."
if rclone copy "$BACKUP_FILE" "$R2_REMOTE/"; then
    log_info "Upload complete"
else
    log_error "Upload failed!"
    exit 1
fi

# Clean up local file
rm -f "$BACKUP_FILE"

# Clean up old backups (retention)
log_info "Cleaning up old backups (older than ${RETENTION_DAYS} days)..."
rclone delete "$R2_REMOTE/" --min-age "${RETENTION_DAYS}d"

log_info "Backup completed successfully!"

# Send notification (optional)
if [ -n "$WEBHOOK_URL" ]; then
    curl -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{\"text\": \"TypeForge ${REGION} backup completed: ${DATE}\"}"
fi
