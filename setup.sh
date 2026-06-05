#!/bin/bash

# Setup script for the agentic engineering team

echo "📦 Installing dependencies..."
npm install

echo ""
echo "⚙️  Building TypeScript..."
npm run build

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Copy .env.example to .env"
echo "  2. Add your OpenAI API key to .env"
echo "  3. Run: npm start"
echo ""
