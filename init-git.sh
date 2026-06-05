#!/bin/bash

# Initialize git repository and make commits for each phase
# This shows the iteration/improvement process

echo "🎯 Setting up git repository..."

git init

# Initial commit: specs and architecture
git add .
git commit -m "feat: Initialize agentic engineering team with spec and orchestrator"

echo "✅ Git repository initialized"
echo ""
echo "📊 This repo will show:"
echo "  - Each phase of the build process"
echo "  - Agent decisions and reasoning"
echo "  - Code iteration and improvement"
echo "  - Self-correction when issues are found"
echo ""
