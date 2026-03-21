#!/bin/bash
# TypeForge — Database Restore Script
# Download from R2 and restore to PostgreSQL

set -e

# Configuration
REGION="${REGION:-eu}"
DB_NAME="typeforge_${REGION}"
DB_USER="${DB_USER:-typeforge_admin}"
BACKUP_DIR="/tmp/typeforge-restore"
R2_BUCKET="typeforge-backups"
R2_REMOTE="${R2_BUCKET}/${REGION}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
}

# List available backups
list_backups() {
    log_info "Available backups:"
    rclone ls "$R2_REMOTE/" | sort -r
}

# Restore specific backup
restore_backup() {
    local BACKUP_FILE="$1"
    local LOCAL_FILE="${BACKUP_DIR}/$(basename "$BACKUP_FILE")"
    
    log_warn "This will OVERWRITE the current database!"
    read -p "Are you sure? (yes/no): " confirm
    
    if [ "$confirm" != "yes" ]; then
        log_info "Restore cancelled"
        exit 0
    fi
    
    # Create restore directory
    mkdir -p "$BACKUP_DIR"
    
    # Download backup
    log_info "Downloading backup..."
    rclone copy "${R2_REMOTE}/${BACKUP_FILE}" "$BACKUP_DIR/"
    
    # Drop existing connections
    log_info "Terminating existing connections..."
    psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();"
    
    # Drop and recreate database
    log_info "Recreating database..."
    psql -U postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"
    psql -U postgres -c "CREATE DATABASE $DB_NAME;"
    
    # Restore
    log_info "Restoring database..."
    gunzip -c "$LOCAL_FILE" | psql -U "$DB_USER" -d "$DB_NAME"
    
    # Clean up
    rm -f "$LOCAL_FILE"
    
    log_info "Restore completed successfully!"
}

# Main
case "${1:-}" in
    list)
        list_backups
        ;;
    restore)
        if [ -z "${2:-}" ]; then
            log_error "Usage: $0 restore <backup-file>"
            exit 1
        fi
        restore_backup "$2"
        ;;
    *)
        echo "Usage: $0 {list|restore <file>}"
        echo ""
        echo "Commands:"
        echo "  list              List available backups"
        echo "  restore <file>    Restore from specific backup"
        exit 1
        ;;
esac
