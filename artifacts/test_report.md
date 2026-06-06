# Test Report

Total tests: 9
Passed: 9
Failed: 0
Duration: 1708ms
Coverage (lines): 86.34%
Coverage (statements): 86.53%
Coverage (functions): 97.29%
Coverage (branches): 66.47%

## Assertions

- [PASSED] reviewer-agent.test.ts: ReviewerAgent > produces findings from shipped source code instead of orchestrator constants
- [PASSED] orchestrator.test.ts: EngineeringOrchestrator > writes manifest and reviewer-facing artifacts from a verified run
- [PASSED] jwt-auth.test.ts: JWTAuth > issues access and refresh tokens and verifies both
- [PASSED] jwt-auth.test.ts: JWTAuth > rejects expired access tokens
- [PASSED] jwt-auth.test.ts: JWTAuth > attaches verified access claims in middleware
- [PASSED] request-validator.test.ts: RequestValidator > coerces primitives and applies custom validators
- [PASSED] request-validator.test.ts: RequestValidator > returns structured 400 responses for invalid payloads
- [PASSED] rate-limiter.test.ts: RateLimiter > uses a token bucket per key and refills over time
- [PASSED] rate-limiter.test.ts: RateLimiter > returns 429 responses with operational headers when a client is throttled
