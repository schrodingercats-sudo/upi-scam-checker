#!/bin/bash

# UPI Guard Deployment Script
echo "🚀 Starting UPI Guard deployment setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3.11+ first."
    exit 1
fi

# Check if Git is initialized
if [ ! -d ".git" ]; then
    print_status "Initializing Git repository..."
    git init
    print_success "Git repository initialized"
fi

# Install frontend dependencies
print_status "Installing frontend dependencies..."
npm install
if [ $? -eq 0 ]; then
    print_success "Frontend dependencies installed"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

# Install backend dependencies
print_status "Installing backend dependencies..."
cd render_backend
pip3 install -r requirements.txt
if [ $? -eq 0 ]; then
    print_success "Backend dependencies installed"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi
cd ..

# Create environment file if it doesn't exist
if [ ! -f ".env.local" ]; then
    print_status "Creating environment file..."
    cp .env.example .env.local
    print_warning "Please edit .env.local with your API keys before deployment"
fi

# Run linting
print_status "Running code quality checks..."
npm run lint
if [ $? -eq 0 ]; then
    print_success "Code quality checks passed"
else
    print_warning "Code quality checks failed, but continuing..."
fi

# Build the application
print_status "Building application..."
npm run build
if [ $? -eq 0 ]; then
    print_success "Application built successfully"
else
    print_error "Build failed"
    exit 1
fi

print_success "🎉 Deployment setup completed!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your API keys"
echo "2. Commit your changes: git add . && git commit -m 'Initial commit'"
echo "3. Push to GitHub: git remote add origin <your-repo-url> && git push -u origin main"
echo "4. Deploy to Vercel: Visit https://vercel.com and import your GitHub repository"
echo "5. Deploy backend to Render: Visit https://render.com and create a new web service"
echo ""
echo "For detailed instructions, see DEPLOYMENT_README.md"