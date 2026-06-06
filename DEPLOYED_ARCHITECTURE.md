# Express Middleware Suite Architecture

A scoped engineering pod that turns one backend spec into a real middleware package, executable tests, and review artifacts.

## Workflow

1. Architect translates the spec into module boundaries and quality gates.
2. Implementer ships one focused middleware package with explicit tradeoffs.
3. Reviewer runs independent static analysis over the shipped files and flags operational risks before ship.
4. Tester validates the feature through executable Jest suites and coverage output.

## Modules

### RateLimiter

Protect routes with token-bucket throttling and transparent headers.

Source files: src/middleware/rate-limiter.ts

Verification goals:
- Per-key isolation
- Token refill over time
- 429 responses expose retry headers

### RequestValidator

Validate request payloads with a small schema DSL, coercion, and custom rules.

Source files: src/middleware/request-validator.ts

Verification goals:
- Coercion for strings, numbers, and booleans
- Unknown-field rejection
- Custom validator hooks

### JWTAuth

Issue, verify, and refresh signed tokens while keeping access and refresh secrets separate.

Source files: src/middleware/jwt-auth.ts

Verification goals:
- Access token verification
- Refresh token exchange
- Route middleware rejects missing or expired tokens

## Implementation Notes

- Kept the worked example dependency-light so the repo can run without network calls or registry installs.
- Split each middleware concern into its own module to make review and testing explicit.
- Kept the public API small enough for a reviewer to understand in one pass.

Total shipped middleware LOC: 590

## Deployment Notes

- This worked example keeps state in memory for the rate limiter to stay runnable in a review environment.
- JWT refresh tokens are stateless; revocation would require a persistent session store in production.
- The validation layer is intentionally focused on common primitives rather than full JSON Schema.
