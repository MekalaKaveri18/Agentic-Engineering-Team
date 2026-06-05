# Test Report

Total tests: 8
Passed: 8
Failed: 0
Duration: 2795ms
Coverage (lines): 86.12%
Coverage (statements): 86.17%
Coverage (functions): 96.66%
Coverage (branches): 66.89%

## Assertions

- [PASSED] orchestrator.test.ts: EngineeringOrchestrator > writes manifest and reviewer-facing artifacts from a verified run
- [PASSED] request-validator.test.ts: RequestValidator > coerces primitives and applies custom validators
- [PASSED] request-validator.test.ts: RequestValidator > returns structured 400 responses for invalid payloads
- [PASSED] jwt-auth.test.ts: JWTAuth > issues access and refresh tokens and verifies both
- [PASSED] jwt-auth.test.ts: JWTAuth > rejects expired access tokens
- [PASSED] jwt-auth.test.ts: JWTAuth > attaches verified access claims in middleware
- [PASSED] rate-limiter.test.ts: RateLimiter > uses a token bucket per key and refills over time
- [PASSED] rate-limiter.test.ts: RateLimiter > returns 429 responses with operational headers when a client is throttled
