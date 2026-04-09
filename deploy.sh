#!/bin/bash

# Aim Trainer Deployment Script
# Builds and runs Docker containers for the complete application

set -e  # Exit on error

echo "╔════════════════════════════════════════╗"
echo "║     AIM TRAINER - DEPLOYMENT SCRIPT    ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Configuration
PROJECT_NAME="aim-trainer"
FRONTEND_IMAGE="$PROJECT_NAME-frontend:latest"
BACKEND_IMAGE="$PROJECT_NAME-backend:latest"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗${NC} Docker is not installed. Please install Docker first."
    exit 1
fi

print_status "Docker is installed"

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}✗${NC} docker-compose is not installed. Please install docker-compose first."
    exit 1
fi

print_status "docker-compose is installed"

# Parse command line arguments
COMMAND=${1:-"up"}

case "$COMMAND" in
    "up")
        echo ""
        print_info "Starting services..."
        echo ""

        # Build images
        print_info "Building Docker images..."
        docker-compose build

        echo ""
        print_status "Images built successfully"

        # Start containers
        print_info "Starting containers..."
        docker-compose up -d

        echo ""
        print_status "Containers started successfully"

        # Wait for services to be ready
        print_info "Waiting for services to be ready..."
        sleep 3

        echo ""
        echo "╔════════════════════════════════════════╗"
        echo "║        SERVICES ARE RUNNING            ║"
        echo "╚════════════════════════════════════════╝"
        echo ""
        echo "Frontend:  http://localhost:3000"
        echo "Backend:   http://localhost:8000"
        echo "API Docs:  http://localhost:8000/docs"
        echo "MongoDB:   mongodb://localhost:27017"
        echo ""
        print_info "To view logs: docker-compose logs -f"
        print_info "To stop services: docker-compose down"
        echo ""
        ;;

    "down")
        print_info "Stopping services..."
        docker-compose down
        print_status "Services stopped"
        ;;

    "restart")
        print_info "Restarting services..."
        docker-compose restart
        print_status "Services restarted"
        ;;

    "logs")
        docker-compose logs -f
        ;;

    "clean")
        print_warn "Removing all containers and volumes..."
        docker-compose down -v
        print_status "Cleaned up"
        ;;

    "build")
        print_info "Building images..."
        docker-compose build
        print_status "Images built"
        ;;

    "status")
        print_info "Service status:"
        docker-compose ps
        ;;

    *)
        echo "Usage: ./deploy.sh [command]"
        echo ""
        echo "Commands:"
        echo "  up       - Build and start all services (default)"
        echo "  down     - Stop all services"
        echo "  restart  - Restart all services"
        echo "  logs     - View logs from all services"
        echo "  build    - Build Docker images only"
        echo "  clean    - Remove containers and volumes"
        echo "  status   - Show service status"
        echo ""
        exit 1
        ;;
esac

exit 0
