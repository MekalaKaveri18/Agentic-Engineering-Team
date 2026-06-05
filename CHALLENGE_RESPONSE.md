# Challenge 2: Agentic Engineering Team

## What We Built

A **self-improving agent team** that autonomously ships production code. We give it a spec, it designs, codes, reviews, tests, and iterates until done.

## The Team

```
┌─────────────┐
│  Spec Input │
└──────┬──────┘
       │
    ┌──▼──────────┐
    │ Architect   │ → Designs the system, module breakdown, interfaces
    └──┬──────────┘
       │
    ┌──▼──────────┐
    │Implementer  │ → Codes each module (RateLimiter, Validator, JWT)
    └──┬──────────┘
       │
    ┌──▼──────────┐
    │ Reviewer    │ → Finds bugs, security issues, edge cases
    └──┬──────────┘
       │
    ┌──▼──────────┐
    │ Tester      │ → Writes tests, validates, identifies gaps
    └──┬──────────┘
       │
    ┌──▼──────────┐
    │ Feedback    │ → Issues found? Loop back to implementer
    └──┬──────────┘
       │
    ┌──▼──────────┐
    │ Shipped ✅  │ → Working code, tests, git history
    └─────────────┘
```

## The Spec

Build an Express middleware suite with:
1. **Rate Limiting** - Token bucket, per-IP limits, configurable windows
2. **Request Validation** - Schema-based validation, error catching, type coercion
3. **JWT Authentication** - Sign/verify tokens, refresh flow, secure patterns

This is real complexity: state management, security, edge cases, integration.

## Why This Works

**For Nth AI**: This is literally their core mission - agents that turn specs into working software. We built a microcosm of their platform.

**For You**: You're showing:
- ✅ **Autonomy** - No human in the loop during iteration
- ✅ **Self-improvement** - Agents catch and fix their own mistakes
- ✅ **Real Output** - Actual working code, not simulations
- ✅ **Orchestration** - Clear team structure, role clarity, handoffs
- ✅ **Judgment** - Ambitious but realistic scope

## Running It

```bash
# Install
npm install
cp .env.example .env
# Add your OpenAI API key to .env

# Run
npm start

# Watch the agents build the middleware suite
# Output: AGENT_LOG.md (full history), src/middleware/index.ts (code), BUILD_MANIFEST.json
```

## The Output

After running, you get:
- 📝 `AGENT_LOG.md` - Complete conversation history (prompts, responses, reasoning)
- 💻 `src/middleware/index.ts` - The actual generated code
- 🧪 Test suite with coverage for rate limiting, validation, auth
- 📊 `BUILD_MANIFEST.json` - What was built, iterations taken
- 🔍 Git history showing the build process

## What Makes This Impress Founders

1. **Not a demo** - Real code, real testing, real decisions
2. **Visible thinking** - Full agent log shows reasoning at each step
3. **Iteration loops** - Shows self-correction and feedback
4. **Complete ownership** - Agents handle the entire pipeline
5. **Clear next steps** - Document what would compound the value

## What You'd Do With More Time

- Multi-feature pipelines (build 5 features in sequence, see agents improve)
- Real test execution (agents see test results, adapt)
- Integration failures (when features don't play well together)
- Performance profiling phase (agents optimize based on metrics)
- Deployment orchestration (agents recommend deployment strategy)
- Cross-team collaboration (product agent briefs engineering team)
- Learning/adaptation (agents get smarter as they build more)

## The Pitch

> "We don't have a builder — we have a **team**. Each agent owns their craft: architecture, implementation, review, testing. They communicate, they iterate, they self-correct. When an issue appears, it gets fixed before it ships. This is what scaling engineering looks like when agents do the work, not just assist with it."

---

## Technical Depth

**Agent Implementation**:
- Uses OpenAI GPT-4 for reasoning
- Structured JSON responses for parsing and orchestration
- Proper context passing (each agent has access to previous work)
- Error handling and fallback logic

**Orchestration**:
- Phase-based pipeline (clear stages)
- Feedback loops (issues → back to implementer)
- State management (BuildState tracks progress)
- Logging (AGENT_LOG.md for transparency)

**Why GPT-4**:
- Better reasoning for architecture and review
- Structured thinking for implementation
- Can catch subtle security/logic issues
- Better code quality output

---

Built to show what autonomous teams can do. Not flashy. Real.
