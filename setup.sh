#!/usr/bin/env bash

echo "Installing dependencies..."
npm install

echo ""
echo "Building project..."
npm run build

echo ""
echo "Setup complete."
echo "Run 'npm start' to execute the full plan -> implement -> review -> test workflow."
