import { FeatureSpec } from "./types";

export const WORKED_EXAMPLE_SPEC_TEXT = `Feature: Express middleware suite

Build a small but production-minded middleware package for Node/Express with:
1. Rate limiting
   - Token bucket algorithm
   - Per-IP isolation
   - Configurable limits and windows
   - Clear limit-exceeded headers

2. Request validation
   - Schema-based validation
   - Type coercion for common primitives
   - Custom validators for business rules
   - Consistent error formatting

3. JWT authentication
   - Sign and verify access tokens
   - Refresh token flow
   - Expiry enforcement
   - Middleware to protect routes

Non-functional requirements
- TypeScript
- Real automated tests
- Clear orchestration artifacts
- Honest scope and operational tradeoffs`;

export const WORKED_EXAMPLE_SPEC: FeatureSpec = {
  name: "Express Middleware Suite",
  summary:
    "A scoped engineering pod that turns one backend spec into a real middleware package, executable tests, and review artifacts.",
  modules: [
    {
      title: "Rate limiting",
      details: [
        "Use a token bucket instead of a fixed counter",
        "Track request budgets per client key",
        "Return operational headers when throttling",
      ],
    },
    {
      title: "Request validation",
      details: [
        "Use a focused schema DSL for common primitives",
        "Coerce string inputs into numbers and booleans when requested",
        "Support custom validation hooks",
      ],
    },
    {
      title: "JWT authentication",
      details: [
        "Separate access and refresh secrets",
        "Enforce expiry, issuer, and audience",
        "Provide a refresh flow and route middleware",
      ],
    },
  ],
  nonFunctionalRequirements: [
    "Keep the package dependency-light so it runs offline in review environments",
    "Prefer explicit tradeoffs over fake completeness",
    "Generate artifacts that show planning, review, and test outcomes",
  ],
  acceptanceCriteria: [
    "Build succeeds with `npm run build`",
    "Tests pass with `npm test`",
    "Running `npm start` produces an agent log, architecture summary, review report, and build manifest",
  ],
};
