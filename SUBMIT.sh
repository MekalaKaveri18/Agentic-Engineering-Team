#!/usr/bin/env bash

echo "Nth AI Challenge 2 submission helper"
echo ""
echo "1. Create a GitHub repository."
echo "2. From this folder run:"
echo "   git init"
echo "   git add ."
echo "   git commit -m \"Challenge 2: agentic engineering team\""
echo "   git branch -M main"
echo "   git remote add origin https://github.com/YOUR_USERNAME/agentic-engineering-team.git"
echo "   git push -u origin main"
echo ""
echo "Suggested note to send:"
echo ""
cat <<'EOF'
Challenge selected: #2

Built a small agentic engineering team that takes one spec and ships one worked example through planning, implementation, review, and test.

The worked example is an Express middleware package with rate limiting, request validation, and auth. Running `npm start` rebuilds the repo, runs the Jest suite, and generates the architecture, review, test, and ship artifacts from that verified run.

Start here:
- SUBMISSION.md
- AGENT_LOG.md
- BUILD_MANIFEST.json
- artifacts/

With more time I would add live model-backed planning, distributed rate-limit storage, refresh-session persistence, and more worked examples.
EOF
