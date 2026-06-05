# Agentic Engineering Team

This repo is about:

> Build a team of agents that takes a spec and ships code - plan, implement, review, test - with one worked example shipping a small feature autonomously.

The project is a scoped engineering pod with five explicit roles:

1. Architect
2. Implementer
3. Reviewer
4. Tester
5. Orchestrator

The worked example is a small Express middleware package with three modules:

- `RateLimiter`
- `RequestValidator`
- `JWTAuth`

## What Happens

When you run `npm start`, the repo:

1. Builds the TypeScript project
2. Runs the automated Jest suite
3. Generates ship artifacts from that verified run

No API key is required for the current submission. The goal here is a runnable, reviewable engineering workflow rather than a live model demo.

## How The Agent Team Maps To The Repo

- `Plan`: [DEPLOYED_ARCHITECTURE.md](/c:/Users/HP/Downloads/NthAI/agentic-engineering-team/DEPLOYED_ARCHITECTURE.md)
- `Implement`: [src/middleware](/c:/Users/HP/Downloads/NthAI/agentic-engineering-team/src/middleware)
- `Review`: [artifacts/review_report.md](/c:/Users/HP/Downloads/NthAI/agentic-engineering-team/artifacts/review_report.md)
- `Test`: [src/__tests__](/c:/Users/HP/Downloads/NthAI/agentic-engineering-team/src/__tests__) and [artifacts/test_report.md](/c:/Users/HP/Downloads/NthAI/agentic-engineering-team/artifacts/test_report.md)
- `Ship`: [BUILD_MANIFEST.json](/c:/Users/HP/Downloads/NthAI/agentic-engineering-team/BUILD_MANIFEST.json) and [artifacts/pull_request.md](/c:/Users/HP/Downloads/NthAI/agentic-engineering-team/artifacts/pull_request.md)

## Run It

```bash
npm install
npm start
```

Useful commands:

```bash
npm run build
npm test
npm run dev
```

## Output

After a successful run you will have:

- [AGENT_LOG.md](/c:/Users/HP/Downloads/NthAI/agentic-engineering-team/AGENT_LOG.md): agent-by-agent handoffs
- [BUILD_MANIFEST.json](/c:/Users/HP/Downloads/NthAI/agentic-engineering-team/BUILD_MANIFEST.json): machine-readable ship record
- [DEPLOYED_ARCHITECTURE.md](/c:/Users/HP/Downloads/NthAI/agentic-engineering-team/DEPLOYED_ARCHITECTURE.md): planning artifact
- [artifacts](/c:/Users/HP/Downloads/NthAI/agentic-engineering-team/artifacts): review, test, and pull request summaries

## Worked Example Scope

The feature is intentionally small and honest:

- Rate limiting uses an in-memory token bucket
- Validation uses a focused schema DSL with coercion and custom rules
- Auth uses signed access and refresh tokens with route middleware

Known tradeoffs are captured in the review report instead of being hidden.

## Start Here

- [SUBMISSION.md](/c:/Users/HP/Downloads/NthAI/agentic-engineering-team/SUBMISSION.md)
- [QUICKSTART.md](/c:/Users/HP/Downloads/NthAI/agentic-engineering-team/QUICKSTART.md)
