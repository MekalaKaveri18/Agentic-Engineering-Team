# Challenge 2 Submission

I picked Challenge 2 and built a small agentic engineering team that takes one fixed spec and ships one worked example through planning, implementation, review, and test.

The worked example is an Express middleware package with three modules:

- `RateLimiter`
- `RequestValidator`
- `JWTAuth`

## What The Team Does

The team is explicit in the repo rather than implied:

1. `Architect`
   Produces the plan and module boundaries.
   Output: [DEPLOYED_ARCHITECTURE.md](/c:/Users/HP/Downloads/NthAI/agentic-engineering-team/DEPLOYED_ARCHITECTURE.md)

2. `Implementer`
   Ships the feature code.
   Output: [src/middleware](/c:/Users/HP/Downloads/NthAI/agentic-engineering-team/src/middleware)

3. `Reviewer`
   Runs independent static analysis over the shipped files and surfaces risks before ship.
   Output: [artifacts/review_report.md](/c:/Users/HP/Downloads/NthAI/agentic-engineering-team/artifacts/review_report.md)

4. `Tester`
   Runs executable tests and records results.
   Output: [src/__tests__](/c:/Users/HP/Downloads/NthAI/agentic-engineering-team/src/__tests__) and [artifacts/test_report.md](/c:/Users/HP/Downloads/NthAI/agentic-engineering-team/artifacts/test_report.md)

5. `Orchestrator`
   Turns the verified run into reviewer-friendly artifacts.
   Output: [AGENT_LOG.md](/c:/Users/HP/Downloads/NthAI/agentic-engineering-team/AGENT_LOG.md), [BUILD_MANIFEST.json](/c:/Users/HP/Downloads/NthAI/agentic-engineering-team/BUILD_MANIFEST.json), and [artifacts/pull_request.md](/c:/Users/HP/Downloads/NthAI/agentic-engineering-team/artifacts/pull_request.md)

## Why This Matches The Prompt

The requirement was:

> Build a team of agents that takes a spec and ships code - plan, implement, review, test - with one worked example shipping a small feature autonomously.

This repo maps directly to that:

- `Plan`: architecture and module plan
- `Implement`: three shipped middleware modules
- `Review`: explicit review findings and recommendations
- `Test`: real Jest tests executed in the run
- `Ship`: manifest and pull request artifacts generated after verification

## How To Evaluate It

Run:

```bash
npm install
npm start
```

That single command:

1. Compiles the repo
2. Executes the test suite
3. Generates the final artifacts from the verified run

Useful files:

- [AGENT_LOG.md](/c:/Users/HP/Downloads/NthAI/agentic-engineering-team/AGENT_LOG.md)
- [BUILD_MANIFEST.json](/c:/Users/HP/Downloads/NthAI/agentic-engineering-team/BUILD_MANIFEST.json)
- [DEPLOYED_ARCHITECTURE.md](/c:/Users/HP/Downloads/NthAI/agentic-engineering-team/DEPLOYED_ARCHITECTURE.md)
- [artifacts/review_report.md](/c:/Users/HP/Downloads/NthAI/agentic-engineering-team/artifacts/review_report.md)
- [artifacts/test_report.md](/c:/Users/HP/Downloads/NthAI/agentic-engineering-team/artifacts/test_report.md)

## What Is Honest About The Submission

This is not presented as an open-ended live coding agent with hidden model calls. It is presented as a runnable engineering workflow with explicit roles, real code, real tests, and explicit tradeoffs.

Current known tradeoffs:

- Rate limiting is single-node because it uses in-memory buckets
- Refresh-token revocation is not persisted
- The schema engine is focused, not full JSON Schema

Those tradeoffs are documented in the shipped review artifact instead of being glossed over.

## What I Would Do Next With More Time

- Swap the deterministic planner for a live model-backed planner
- Add a shared storage adapter for distributed rate limiting
- Add persistent session storage for refresh-token revocation
- Expand the validation engine for nested schema support
- Add more worked examples so the team can ship multiple specs, not just one

## Bottom Line

This repo does one thing clearly: it shows a team of agents taking a spec and shipping a small feature through plan, implement, review, and test, with artifacts that make every handoff inspectable.
