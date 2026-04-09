#!/bin/bash

# Aim Trainer - Quick Start Guide
# This script sets up and runs the project locally

echo "🎯 Aim Trainer - Quick Start"
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js is not installed. Please install Node.js 18+ first."
  exit 1
fi

# Check for Python
if ! command -v python3 &> /dev/null; then
  echo "❌ Python 3 is not installed. Please install Python 3.11+ first."
  exit 1
fi

echo "✅ Dependencies check passed"
echo ""

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Frontend setup
echo "📦 Setting up frontend..."
cd "$SCRIPT_DIR/frontend"
npm install

if [ -x "npm" ]; then
  echo "✅ Frontend ready. Run 'npm run dev' in frontend/ to start"
fi

echo ""

# Backend setup
echo "📦 Setting up backend..."
cd "$SCRIPT_DIR/backend"

# Create virtual environment
if [ ! -d "venv" ]; then
  python3 -m venv venv
fi

# Activate venv and install
source venv/bin/activate || . venv/Scripts/activate
pip install -r requirements.txt

echo "✅ Backend ready. Run 'uvicorn app.main:app --reload --port 8000' in backend/ to start"

echo ""
echo "📋 Next steps:"
echo "1. Start MongoDB: docker run -d -p 27017:27017 mongo:7.0"
echo "2. In terminal 1: cd frontend && npm run dev"
echo "3. In terminal 2: cd backend && uvicorn app.main:app --reload --port 8000"
echo "4. Open http://localhost:3000"
echo ""
echo "Or use Docker:"
echo "  ./deploy.sh up"
echo ""
