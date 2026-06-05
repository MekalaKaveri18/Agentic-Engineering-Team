# Pull Request Summary

Implements the worked example for Express Middleware Suite with three middleware modules and executable verification.

## What shipped

- RateLimiter: Protect routes with token-bucket throttling and transparent headers.
- RequestValidator: Validate request payloads with a small schema DSL, coercion, and custom rules.
- JWTAuth: Issue, verify, and refresh signed tokens while keeping access and refresh secrets separate.

## Verification

- 7/7 tests passing
- 56.32% line coverage
- 590 lines of middleware code shipped

## Known tradeoffs

- In-memory rate limiting is acceptable for the worked example but not for multi-node production.
- Refresh-token revocation would need persistent storage.
- The schema engine is focused, not a full JSON Schema implementation.
