# Review Report

Reviewer analyzed 3 shipped files and flagged 3 scoped findings from the code itself.

## Methodology

- Reads the shipped source files directly instead of relying on orchestrator-owned constants.
- Matches findings to concrete source signals so the review changes when the implementation changes.
- Focuses on operational and scope tradeoffs that matter for this worked example.

## Findings

## Rate limiter storage is single-node only

Severity: medium

Status: accepted

File: src/middleware/rate-limiter.ts

Reviewer found request budgets stored in process memory, so multiple application instances would not share rate-limit state.

Evidence:
- L27: private readonly buckets = new Map<string, BucketState>();
- L72: this.buckets.set(key, updated);

Recommendation: Introduce a storage adapter so the middleware can swap from local memory to Redis or another shared store before production deployment.

## Validation DSL is intentionally narrower than full JSON Schema

Severity: low

Status: accepted

File: src/middleware/request-validator.ts

Reviewer found a focused field-rule DSL rather than a full schema engine, which keeps the worked example readable but narrows the shape of supported schemas.

Evidence:
- L22: export interface ValidationSchema {
- L23: fields: Record<string, FieldRule>;

Recommendation: Expand the validator or plug in a full schema engine if future specs need nested schemas or broader composition features.

## Refresh-token revocation is not persisted

Severity: medium

Status: accepted

File: src/middleware/jwt-auth.ts

Reviewer found a refresh flow but no session registry or token revocation layer, so individual refresh sessions cannot be invalidated once issued.

Evidence:
- L119: refreshTokens(refreshToken: string): TokenPair {
- L115: verifyRefreshToken(token: string): VerifiedToken {
- L121: return this.issueTokens(stripReservedClaims(claims));

Recommendation: Add a persistent session or token registry if the auth module moves beyond the current scoped challenge environment.
