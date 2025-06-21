#!/bin/bash

# Manual Setup Script for SpurHacked

echo "🌍 SpurHacked Manual Setup"
echo "=========================="
echo ""
echo "This script will guide you through the manual setup process."
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.7+ first."
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"
echo ""

# Create virtual environment
echo "Step 1: Creating virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "✅ Virtual environment created!"
else
    echo "✅ Virtual environment already exists!"
fi
echo ""

# Instructions for activation
echo "Step 2: Activate the virtual environment"
echo "Run this command:"
echo "  source venv/bin/activate"
echo ""

# Instructions for installing dependencies
echo "Step 3: Install dependencies"
echo "After activating the virtual environment, run:"
echo "  cd backend"
echo "  pip install -r requirements.txt"
echo ""

# Instructions for running the server
echo "Step 4: Start the backend server"
echo "Run this command:"
echo "  python app.py"
echo ""

# Instructions for Chrome extension
echo "Step 5: Load the Chrome extension"
echo "1. Open Chrome and go to chrome://extensions/"
echo "2. Enable 'Developer mode'"
echo "3. Click 'Load unpacked'"
echo "4. Select the 'extension' folder from this project"
echo ""

echo "🎉 Setup complete! The backend will run on http://localhost:5000"
echo ""
echo "Note: You'll need to activate the virtual environment each time you want to run the backend:"
echo "  source venv/bin/activate" 