#!/bin/bash

# Money Monitor - Docker Database Management Script
# This script helps manage the PostgreSQL database container for development

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CONTAINER_NAME="money-monitor-postgres"
PGADMIN_CONTAINER="money-monitor-pgadmin"
COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env"
# Get DATA_DIR from environment or use default
DATA_DIR="${DATA_DIR:-./postgres_data}"

# Helper functions
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_header() {
    echo -e "\n${BLUE}=== Money Monitor Database Manager ===${NC}\n"
}

# Check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop and try again."
        exit 1
    fi
}

# Check if docker-compose file exists
check_compose_file() {
    if [ ! -f "$COMPOSE_FILE" ]; then
        print_error "docker-compose.yml not found in current directory"
        print_info "Make sure you're in the money-monitor project root"
        exit 1
    fi
}

# Setup environment file
setup_env() {
    if [ ! -f "$ENV_FILE" ]; then
        if [ -f ".env.development" ]; then
            print_info "Copying .env.development to .env"
            cp .env.development .env
            print_success "Environment file created"
        else
            print_warning "No .env file found. Creating basic environment file..."
            cat > .env << 'EOF'
# Basic development environment
DATABASE_URL=postgresql://postgres:dev_password_123@localhost:5432/money_monitor
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=dev_password_123
DB_NAME=money_monitor
DB_SSL=false
ENCRYPTION_KEY=dev_key_32_bytes_for_local_development_only_never_use_in_production_123456
NODE_ENV=development
EOF
            print_success "Basic .env file created"
        fi
    else
        print_info ".env file already exists"
    fi
}

# Create data directory
create_data_dir() {
    # Convert relative path to absolute path
    if [[ "$DATA_DIR" != /* ]]; then
        DATA_DIR="$(pwd)/$DATA_DIR"
    fi

    if [ ! -d "$DATA_DIR" ]; then
        print_info "Creating data directory: $DATA_DIR"
        mkdir -p "$DATA_DIR"
        print_success "Data directory created"
    else
        print_info "Data directory already exists: $DATA_DIR"
    fi
}

# Start database
start_db() {
    print_header
    print_info "Starting PostgreSQL database..."

    check_docker
    check_compose_file
    setup_env
    create_data_dir

    # Start only the postgres service
    docker-compose up -d postgres

    print_info "Waiting for database to be ready..."

    # Wait for database to be healthy
    for i in {1..30}; do
        if docker-compose exec postgres pg_isready -U postgres -d money_monitor >/dev/null 2>&1; then
            print_success "Database is ready!"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "Database failed to start within 30 seconds"
            exit 1
        fi
        sleep 1
    done

    print_success "PostgreSQL is running on localhost:5432"
    print_info "Database: money_monitor"
    print_info "User: postgres"
    print_info "Password: dev_password_123"
    print_info "Data volume: $DATA_DIR"
}

# Start database with pgAdmin
start_with_pgadmin() {
    print_header
    print_info "Starting PostgreSQL database with pgAdmin..."

    check_docker
    check_compose_file
    setup_env
    create_data_dir

    # Start postgres and pgadmin
    docker-compose --profile pgadmin up -d

    print_info "Waiting for services to be ready..."

    # Wait for database
    for i in {1..30}; do
        if docker-compose exec postgres pg_isready -U postgres -d money_monitor >/dev/null 2>&1; then
            print_success "Database is ready!"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "Database failed to start within 30 seconds"
            exit 1
        fi
        sleep 1
    done

    print_success "PostgreSQL is running on localhost:5432"
    print_success "pgAdmin is running on http://localhost:8080"
    print_info "pgAdmin login: admin@moneymonitor.local / admin123"
    print_info "Database connection in pgAdmin:"
    print_info "  Host: postgres (or host.docker.internal)"
    print_info "  Port: 5432"
    print_info "  Database: money_monitor"
    print_info "  Username: postgres"
    print_info "  Password: dev_password_123"
}

# Stop database
stop_db() {
    print_header
    print_info "Stopping database services..."

    check_docker
    check_compose_file

    docker-compose down
    print_success "Database services stopped"
}

# Show status
status() {
    print_header
    check_docker
    check_compose_file

    print_info "Container Status:"

    if docker ps | grep -q "$CONTAINER_NAME"; then
        print_success "PostgreSQL container is running"
        echo "  Container: $CONTAINER_NAME"
        echo "  Port: $(docker port $CONTAINER_NAME 5432 2>/dev/null || echo 'Not exposed')"
    else
        print_warning "PostgreSQL container is not running"
    fi

    if docker ps | grep -q "$PGADMIN_CONTAINER"; then
        print_success "pgAdmin container is running"
        echo "  Container: $PGADMIN_CONTAINER"
        echo "  URL: http://localhost:8080"
    else
        print_info "pgAdmin container is not running"
    fi

    print_info "\nVolume Status:"
    if [ -d "$DATA_DIR" ]; then
        local size=$(du -sh "$DATA_DIR" 2>/dev/null | cut -f1)
        print_info "Data directory exists: $DATA_DIR ($size)"
    else
        print_warning "Data directory does not exist: $DATA_DIR"
    fi
}

# Show logs
logs() {
    print_header
    check_docker
    check_compose_file

    if [ "$1" = "pgadmin" ]; then
        print_info "Showing pgAdmin logs (press Ctrl+C to exit):"
        docker-compose logs -f pgadmin
    else
        print_info "Showing PostgreSQL logs (press Ctrl+C to exit):"
        docker-compose logs -f postgres
    fi
}

# Connect to database
connect() {
    print_header
    check_docker

    if ! docker ps | grep -q "$CONTAINER_NAME"; then
        print_error "PostgreSQL container is not running"
        print_info "Start it with: $0 start"
        exit 1
    fi

    print_info "Connecting to PostgreSQL database..."
    print_info "Type \\q to exit"
    docker-compose exec postgres psql -U postgres -d money_monitor
}

# Reset database (remove all data)
reset() {
    print_header

    # Ensure DATA_DIR is set
    if [[ "$DATA_DIR" != /* ]]; then
        DATA_DIR="$(pwd)/$DATA_DIR"
    fi

    print_warning "This will DELETE ALL database data!"
    print_warning "Data directory: $DATA_DIR"

    read -p "Are you sure? Type 'yes' to continue: " confirm
    if [ "$confirm" != "yes" ]; then
        print_info "Reset cancelled"
        exit 0
    fi

    check_docker
    check_compose_file

    print_info "Stopping containers..."
    docker-compose down

    print_info "Removing data volume..."
    if [ -d "$DATA_DIR" ]; then
        rm -rf "$DATA_DIR"
        print_success "Data directory removed"
    fi

    print_info "Removing Docker volumes..."
    docker-compose down -v

    print_success "Database reset complete"
    print_info "Run '$0 start' to create a fresh database"
}

# Show help
show_help() {
    print_header
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  start         Start PostgreSQL database"
    echo "  start-admin   Start PostgreSQL with pgAdmin web interface"
    echo "  stop          Stop all database services"
    echo "  status        Show status of database services"
    echo "  logs          Show PostgreSQL logs"
    echo "  logs pgadmin  Show pgAdmin logs"
    echo "  connect       Connect to database with psql"
    echo "  reset         Reset database (DELETE ALL DATA)"
    echo "  help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start                 # Start database for development"
    echo "  $0 start-admin          # Start with web management interface"
    echo "  $0 logs                 # View database logs"
    echo "  $0 connect              # Open database shell"
    echo ""
    echo "Database Connection Info:"
    echo "  Host: localhost"
    echo "  Port: 5432"
    echo "  Database: money_monitor"
    echo "  Username: postgres"
    echo "  Password: dev_password_123"
    echo ""
    echo "Data Volume: ${DATA_DIR:-./postgres_data}"
    echo ""
    echo "Environment Variables:"
    echo "  DATA_DIR=<path>         # Custom data directory (default: ./postgres_data)"
    echo ""
    echo "Example with custom data directory:"
    echo "  DATA_DIR=/path/to/data $0 start"
}

# Main command handling
case "${1:-help}" in
    "start")
        start_db
        ;;
    "start-admin")
        start_with_pgadmin
        ;;
    "stop")
        stop_db
        ;;
    "status")
        status
        ;;
    "logs")
        logs "$2"
        ;;
    "connect")
        connect
        ;;
    "reset")
        reset
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
