#!/bin/bash
# TypeForge — Hetzner EU PostgreSQL Setup
# Region: Frankfurt (fsn1)
# Server: CX32 (4 vCPU, 8GB RAM, 80GB NVMe)

set -e

# Configuration
SERVER_NAME="typeforge-db-eu"
SERVER_TYPE="cx32"
IMAGE="ubuntu-24.04"
LOCATION="fsn1"
SSH_KEY_NAME="typeforge-deploy"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check for required tools
check_dependencies() {
    log_info "Checking dependencies..."
    
    if ! command -v hcloud &> /dev/null; then
        log_error "hcloud CLI not found. Please install it first."
        exit 1
    fi
    
    if ! command -v ansible &> /dev/null; then
        log_warn "Ansible not found. Some features may not be available."
    fi
}

# Provision server
provision_server() {
    log_info "Provisioning Hetzner server..."
    
    # Check if server already exists
    if hcloud server list | grep -q "$SERVER_NAME"; then
        log_warn "Server $SERVER_NAME already exists. Skipping provisioning."
        return
    fi
    
    # Create server
    hcloud server create \
        --name "$SERVER_NAME" \
        --type "$SERVER_TYPE" \
        --image "$IMAGE" \
        --location "$LOCATION" \
        --ssh-key "$SSH_KEY_NAME"
    
    log_info "Server provisioned successfully"
}

# Get server IP
get_server_ip() {
    hcloud server ip "$SERVER_NAME"
}

# Configure firewall
configure_firewall() {
    log_info "Configuring firewall..."
    
    local SERVER_IP=$(get_server_ip)
    
    # Create firewall if not exists
    if ! hcloud firewall list | grep -q "typeforge-db-firewall"; then
        hcloud firewall create --name typeforge-db-firewall
    fi
    
    # Add rules
    hcloud firewall add-rule typeforge-db-firewall \
        --direction in \
        --protocol tcp \
        --port 22 \
        --source-ips "0.0.0.0/0" \
        --description "SSH access"
    
    hcloud firewall add-rule typeforge-db-firewall \
        --direction in \
        --protocol tcp \
        --port 5432 \
        --source-ips "0.0.0.0/0" \
        --description "PostgreSQL direct (restrict in production)"
    
    hcloud firewall add-rule typeforge-db-firewall \
        --direction in \
        --protocol tcp \
        --port 6432 \
        --source-ips "0.0.0.0/0" \
        --description "PgBouncer"
    
    # Apply to server
    hcloud firewall apply-to-resource typeforge-db-firewall --type server --server "$SERVER_NAME"
    
    log_info "Firewall configured"
}

# Main execution
main() {
    log_info "Starting Hetzner EU setup..."
    
    check_dependencies
    provision_server
    configure_firewall
    
    local SERVER_IP=$(get_server_ip)
    log_info "Server IP: $SERVER_IP"
    log_info "Next steps:"
    log_info "1. SSH into the server: ssh root@$SERVER_IP"
    log_info "2. Run: ansible-playbook -i $SERVER_IP, postgresql.yml"
    
    log_info "Hetzner EU setup complete!"
}

main "$@"
