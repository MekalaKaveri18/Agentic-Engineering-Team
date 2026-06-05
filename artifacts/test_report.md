# Test Report

Total tests: 7
Passed: 7
Failed: 0
Duration: 1424ms
Coverage (lines): 56.32%
Coverage (statements): 56.5%
Coverage (functions): 43.33%
Coverage (branches): 56.55%

## Assertions

- [PASSED] request-validator.test.ts: RequestValidator > coerces primitives and applies custom validators
- [PASSED] request-validator.test.ts: RequestValidator > returns structured 400 responses for invalid payloads
- [PASSED] jwt-auth.test.ts: JWTAuth > issues access and refresh tokens and verifies both
- [PASSED] jwt-auth.test.ts: JWTAuth > rejects expired access tokens
- [PASSED] jwt-auth.test.ts: JWTAuth > attaches verified access claims in middleware
- [PASSED] rate-limiter.test.ts: RateLimiter > uses a token bucket per key and refills over time
- [PASSED] rate-limiter.test.ts: RateLimiter > returns 429 responses with operational headers when a client is throttled
