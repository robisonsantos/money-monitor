#!/bin/bash

# Money Monitor - Development Environment Setup Script
# This script sets up everything needed for local development

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="Money Monitor"
REQUIRED_NODE_VERSION="18"

# Get DATA_DIR from environment or prompt user for it
get_data_dir() {
    if [ -n "$DATA_DIR" ]; then
        # DATA_DIR is already set in environment
        return
    fi

    # Default suggestions based on OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        DEFAULT_DATA_DIR="$HOME/Data/postgres_dkr"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        DEFAULT_DATA_DIR="$HOME/docker-data/postgres_dkr"
    else
        # Windows or other
        DEFAULT_DATA_DIR="./postgres_data"
    fi

    echo -e "${YELLOW}Where would you like to store the PostgreSQL data?${NC}"
    echo -e "${BLUE}Suggested: $DEFAULT_DATA_DIR${NC}"
    echo -e "${BLUE}Default (if empty): ./postgres_data${NC}"
    read -p "Data directory path: " user_input

    if [ -n "$user_input" ]; then
        DATA_DIR="$user_input"
    else
        DATA_DIR="$DEFAULT_DATA_DIR"
    fi

    # Convert relative path to absolute
    if [[ "$DATA_DIR" != /* ]]; then
        DATA_DIR="$(pwd)/$DATA_DIR"
    fi

    export DATA_DIR
    print_success "Data directory set to: $DATA_DIR"
}

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

print_step() {
    echo -e "\n${PURPLE}🔧 $1${NC}"
}

print_header() {
    echo -e "\n${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║           Money Monitor Setup          ║${NC}"
    echo -e "${BLUE}║        Development Environment        ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Node.js version
check_node() {
    if ! command_exists node; then
        print_error "Node.js is not installed"
        print_info "Please install Node.js ${REQUIRED_NODE_VERSION}+ from https://nodejs.org/"
        exit 1
    fi

    local node_version=$(node -v | sed 's/v//' | cut -d. -f1)
    if [ "$node_version" -lt "$REQUIRED_NODE_VERSION" ]; then
        print_error "Node.js version $REQUIRED_NODE_VERSION+ required, found $(node -v)"
        print_info "Please update Node.js from https://nodejs.org/"
        exit 1
    fi

    print_success "Node.js $(node -v) detected"
}

# Check npm
check_npm() {
    if ! command_exists npm; then
        print_error "npm is not installed"
        print_info "npm should come with Node.js. Please reinstall Node.js"
        exit 1
    fi

    print_success "npm $(npm -v) detected"
}

# Check Docker
check_docker() {
    if ! command_exists docker; then
        print_error "Docker is not installed"
        print_info "Please install Docker Desktop from https://www.docker.com/products/docker-desktop"
        exit 1
    fi

    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running"
        print_info "Please start Docker Desktop and try again"
        exit 1
    fi

    print_success "Docker $(docker --version | cut -d' ' -f3 | sed 's/,//') detected and running"
}

# Check Docker Compose
check_docker_compose() {
    if ! docker compose version >/dev/null 2>&1; then
        print_error "Docker Compose is not available"
        print_info "Please install Docker Desktop which includes Docker Compose"
        exit 1
    fi

    print_success "Docker Compose detected"
}

# Create data directory
setup_data_directory() {
    print_step "Setting up data directory"

    # Ensure DATA_DIR is set
    get_data_dir

    if [ ! -d "$DATA_DIR" ]; then
        print_info "Creating data directory: $DATA_DIR"
        mkdir -p "$DATA_DIR"
        print_success "Data directory created"
    else
        print_info "Data directory already exists: $DATA_DIR"
    fi
}

# Setup environment file
setup_environment() {
    print_step "Setting up environment variables"

    if [ ! -f ".env" ]; then
        if [ -f ".env.development" ]; then
            print_info "Copying .env.development to .env"
            cp .env.development .env
            print_success "Environment file created from template"
        else
            print_warning "No .env.development template found, creating basic .env"
            cat > .env << EOF
# Basic development environment for Money Monitor
DATABASE_URL=postgresql://postgres:dev_password_123@localhost:5432/money_monitor
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=dev_password_123
DB_NAME=money_monitor
DB_SSL=false
ENCRYPTION_KEY=dev_key_32_bytes_for_local_development_only_never_use_in_production_123456
NODE_ENV=development
DATA_DIR=$DATA_DIR
EOF
            print_success "Basic .env file created"
        fi
    else
        print_info ".env file already exists"

        # Check if DATA_DIR is set in existing .env and update if needed
        if ! grep -q "^DATA_DIR=" .env; then
            echo "DATA_DIR=$DATA_DIR" >> .env
            print_info "Added DATA_DIR to existing .env file"
        fi
    fi

    print_warning "Make sure to never commit your .env file to version control!"
}

# Install npm dependencies
install_dependencies() {
    print_step "Installing npm dependencies"

    if [ ! -d "node_modules" ]; then
        print_info "Installing packages..."
        npm install
        print_success "Dependencies installed"
    else
        print_info "Dependencies already installed, checking for updates..."
        npm install
        print_success "Dependencies updated"
    fi
}

# Setup database
setup_database() {
    print_step "Setting up PostgreSQL database"

    # Make database script executable
    if [ -f "scripts/db-docker.sh" ]; then
        chmod +x scripts/db-docker.sh
        print_info "Database script permissions set"
    fi

    # Check if database is already running
    if docker ps | grep -q "money-monitor-postgres"; then
        print_info "PostgreSQL container is already running"
    else
        print_info "Starting PostgreSQL database..."
        npm run db:start
        print_success "Database started and initialized"
    fi

    # Test database connection
    print_info "Testing database connection..."
    if docker exec money-monitor-postgres pg_isready -U postgres -d money_monitor >/dev/null 2>&1; then
        print_success "Database connection successful"
    else
        print_error "Database connection failed"
        exit 1
    fi
}

# Setup git hooks
setup_git_hooks() {
    print_step "Setting up git hooks"

    if [ -d ".git" ]; then
        if npm run setup:hooks >/dev/null 2>&1; then
            print_success "Git hooks configured"
        else
            print_warning "Git hooks setup failed (optional)"
        fi
    else
        print_info "Not a git repository, skipping git hooks"
    fi
}

# Run tests
run_tests() {
    print_step "Running test suite"

    print_info "Running unit tests..."
    if npm test >/dev/null 2>&1; then
        print_success "All tests passed"
    else
        print_warning "Some tests failed (check with: npm test)"
    fi
}

# Start development server
start_dev_server() {
    print_step "Starting development server"

    print_info "Starting Money Monitor development server..."
    print_info "The application will be available at: http://localhost:5173"
    print_info "The database is running on: localhost:5432"
    print_info ""
    print_info "To stop the development server: Press Ctrl+C"
    print_info "To stop the database: npm run db:stop"
    print_info ""
    print_success "Setup complete! Starting development server..."

    # Start the dev server (this will block)
    npm run dev
}

# Show final instructions
show_instructions() {
    echo -e "\n${GREEN}╔════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║            Setup Complete!            ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════╝${NC}\n"

    echo -e "${BLUE}🚀 Your development environment is ready!${NC}\n"

    echo -e "${YELLOW}Quick Start Commands:${NC}"
    echo -e "  npm run dev          # Start development server"
    echo -e "  npm run db:start     # Start database"
    echo -e "  npm run db:stop      # Stop database"
    echo -e "  npm run db:status    # Check database status"
    echo -e "  npm test             # Run tests"

    echo -e "\n${YELLOW}Application URLs:${NC}"
    echo -e "  App:      http://localhost:5173"
    echo -e "  Database: localhost:5432"

    echo -e "\n${YELLOW}Database Credentials:${NC}"
    echo -e "  Host:     localhost"
    echo -e "  Port:     5432"
    echo -e "  Database: money_monitor"
    echo -e "  Username: postgres"
    echo -e "  Password: dev_password_123"

    echo -e "\n${YELLOW}Optional pgAdmin:${NC}"
    echo -e "  npm run db:start-admin   # Start with web interface"
    echo -e "  URL: http://localhost:8080"
    echo -e "  Login: admin@moneymonitor.local / admin123"

    echo -e "\n${YELLOW}Data Location:${NC}"
    echo -e "  Database volume: ${DATA_DIR:-./postgres_data}"

    echo -e "\n${YELLOW}Environment Variables:${NC}"
    echo -e "  DATA_DIR=$DATA_DIR"

    echo -e "\n${BLUE}📚 Documentation:${NC}"
    echo -e "  README.md         # Application overview"
    echo -e "  DOCKER_SETUP.md   # Docker database setup"
    echo -e "  DEPLOYMENT.md     # Deployment guide"

    echo -e "\n${GREEN}Happy coding! 🎉${NC}\n"
}

# Main execution
main() {
    print_header

    # Prerequisite checks
    print_step "Checking prerequisites"
    check_node
    check_npm
    check_docker
    check_docker_compose

    # Setup steps
    setup_data_directory
    setup_environment
    install_dependencies
    setup_database
    setup_git_hooks

    # Optional: Run tests
    if [ "${1:-}" != "--no-test" ]; then
        run_tests
    fi

    # Show completion message
    show_instructions

    # Ask if user wants to start dev server
    echo -e "${YELLOW}Would you like to start the development server now? (y/N)${NC}"
    read -r response
    case "$response" in
        [yY][eE][sS]|[yY])
            start_dev_server
            ;;
        *)
            echo -e "\n${BLUE}You can start the development server anytime with:${NC}"
            echo -e "${GREEN}npm run dev${NC}\n"
            ;;
    esac
}

# Handle script arguments
case "${1:-}" in
    "--help"|"-h")
        echo "Money Monitor Development Setup Script"
        echo ""
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --no-test      Skip running tests during setup"
        echo "  --force        Force setup even if components exist"
        echo ""
        echo "Environment Variables:"
        echo "  DATA_DIR       PostgreSQL data directory (default: OS-specific suggestion)"
        echo ""
        echo "Example:"
        echo "  DATA_DIR=/custom/path ./scripts/setup-dev.sh"
        echo ""
        echo "This script will:"
        echo "  1. Check prerequisites (Node.js, npm, Docker)"
        echo "  2. Setup data directory and environment variables"
        echo "  3. Install npm dependencies"
        echo "  4. Start PostgreSQL database in Docker"
        echo "  5. Configure git hooks"
        echo "  6. Run test suite"
        echo "  7. Optionally start development server"
        ;;
    *)
        main "$@"
        ;;
esac
