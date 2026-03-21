#!/bin/bash
# TypeForge — Vultr Africa PostgreSQL Setup
# Region: Johannesburg, South Africa
# Server: VHF-2C-4GB (2 vCPU, 4GB RAM, 80GB NVMe)

set -e

# Configuration
SERVER_NAME="typeforge-db-af"
SERVER_TYPE="vhf-2c-4gb"
REGION="jnb"  # Johannesburg
OS_ID="1743"  # Ubuntu 24.04 x64
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
    
    if ! command -v vultr-cli &> /dev/null; then
        log_error "vultr-cli not found. Please install it first."
        log_info "Install with: pip install vultr-cli"
        exit 1
    fi
    
    if ! command -v ansible &> /dev/null; then
        log_warn "Ansible not found. Some features may not be available."
    fi
}

# Provision server
provision_server() {
    log_info "Provisioning Vultr Africa server..."
    
    # Check if server already exists
    if vultr-cli instance list | grep -q "$SERVER_NAME"; then
        log_warn "Server $SERVER_NAME already exists. Skipping provisioning."
        return
    fi
    
    # Create server
    vultr-cli instance create \
        --region "$REGION" \
        --plan "$SERVER_TYPE" \
        --os "$OS_ID" \
        --hostname "$SERVER_NAME" \
        --ssh-keys "$SSH_KEY_NAME"
    
    log_info "Server provisioned successfully"
}

# Get server IP
get_server_ip() {
    vultr-cli instance list | grep "$SERVER_NAME" | awk '{print $2}'
}

# Configure firewall
configure_firewall() {
    log_info "Configuring firewall..."
    
    # Create firewall group
    vultr-cli firewall group create --description "TypeForge DB Africa"
    
    # Add rules
    vultr-cli firewall rule create \
        --group "TypeForge DB Africa" \
        --protocol tcp \
        --port 22 \
        --subnet 0.0.0.0 \
        --subnet_size 0 \
        --description "SSH access"
    
    vultr-cli firewall rule create \
        --group "TypeForge DB Africa" \
        --protocol tcp \
        --port 5432 \
        --subnet 0.0.0.0 \
        --subnet_size 0 \
        --description "PostgreSQL"
    
    vultr-cli firewall rule create \
        --group "TypeForge DB Africa" \
        --protocol tcp \
        --port 6432 \
        --subnet 0.0.0.0 \
        --subnet_size 0 \
        --description "PgBouncer"
    
    log_info "Firewall configured"
}

# Main execution
main() {
    log_info "Starting Vultr Africa setup..."
    
    check_dependencies
    provision_server
    configure_firewall
    
    local SERVER_IP=$(get_server_ip)
    log_info "Server IP: $SERVER_IP"
    log_info "Next steps:"
    log_info "1. SSH into the server: ssh root@$SERVER_IP"
    log_info "2. Run: ansible-playbook -i $SERVER_IP, postgresql.yml"
    
    log_info "Vultr Africa setup complete!"
}

main "$@"
