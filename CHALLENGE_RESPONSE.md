

Prompt:

> Build a team of agents that takes a spec and ships code - plan, implement, review, test - with one worked example shipping a small feature autonomously.

This repo answers that prompt with a scoped engineering team and one backend worked example.

## Spec

Build an Express middleware package with:

1. Rate limiting
2. Request validation
3. JWT-style auth with access and refresh tokens

## Team

- `Architect`: creates the plan
- `Implementer`: ships the middleware modules
- `Reviewer`: documents risks and accepted tradeoffs
- `Tester`: executes the Jest suite
- `Orchestrator`: writes the manifest and reviewer-facing artifacts

## Where Each Phase Lives

- Plan: [DEPLOYED_ARCHITECTURE.md](/c:/Users/HP/Downloads/NthAI/agentic-engineering-team/DEPLOYED_ARCHITECTURE.md)
- Implement: [src/middleware](/c:/Users/HP/Downloads/NthAI/agentic-engineering-team/src/middleware)
- Review: [artifacts/review_report.md](/c:/Users/HP/Downloads/NthAI/agentic-engineering-team/artifacts/review_report.md)
- Test: [src/__tests__](/c:/Users/HP/Downloads/NthAI/agentic-engineering-team/src/__tests__) and [artifacts/test_report.md](/c:/Users/HP/Downloads/NthAI/agentic-engineering-team/artifacts/test_report.md)
- Ship: [BUILD_MANIFEST.json](/c:/Users/HP/Downloads/NthAI/agentic-engineering-team/BUILD_MANIFEST.json) and [artifacts/pull_request.md](/c:/Users/HP/Downloads/NthAI/agentic-engineering-team/artifacts/pull_request.md)

## Why This Is The Right Scope

The worked example is big enough to show real handoffs and real testing, but small enough to run and inspect in one sitting.

It is intentionally honest about what it does not solve yet:

- distributed rate-limit storage
- refresh-token revocation storage
- full JSON Schema coverage

Those are documented as review findings instead of hidden.
