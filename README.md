# 🤖 Agentic Engineering Team

A self-improving team of agents that autonomously ships production-ready code.

## The Challenge

Build an agent-driven engineering team that takes a specification and ships production code with:
- **Autonomy**: Agents make decisions, catch bugs, iterate
- **Self-improvement**: Feedback loops, reflection, refinement
- **Real output**: Actual working code, not simulations
- **Clean orchestration**: Clear handoffs and communication

## The Team

- **🏗️ Architect**: Takes spec, designs architecture, creates module plan
- **⚙️ Implementer**: Codes each module following the design
- **👀 Reviewer**: Reviews code for quality, security, edge cases
- **✅ Tester**: Writes tests, validates, identifies issues
- **🚀 Orchestrator**: Manages handoffs, feedback loops, self-correction

## The First Mission

**Spec**: Build an Express middleware suite with:
1. **Rate Limiting** - Token bucket pattern, configurable limits
2. **Request Validation** - Schema-based validation with error catching
3. **JWT Authentication** - Sign, verify, refresh token flow

**Why this spec?** It's real complexity: state management, security considerations, and integration challenges. It forces agents to collaborate, catch errors, and iterate.

## How It Works

```
Spec Input
    ↓
[Architect] → Design Phase (creates arch doc)
    ↓
[Implementer] → Code Phase (builds modules)
    ↓
[Reviewer] → Review Phase (catches issues)
    ↓
[Tester] → Test Phase (validates + finds gaps)
    ↓
[Feedback Loop] → Issues found? → Back to Implementer
    ↓
[Shipped] → Working code + git history
```

## What Makes This Impressive

✅ **Real autonomy**: No human in the loop during iteration
✅ **Self-correction**: Agents catch and fix their own mistakes
✅ **Visible iteration**: Git history shows the thinking
✅ **Production-ready**: Code actually works, has tests
✅ **Clear communication**: Each handoff is documented
✅ **Judgment**: Realistic scoping, not trying to do everything at once

## Running It

```bash
# Setup
npm install
cp .env.example .env
# Add your OpenAI API key to .env

# Run the orchestrator
npm run dev

# Watch agents build the middleware suite
```

## Output

After running, you'll have:
- 📁 `/src/middleware/` - Production middleware code
- 📁 `/tests/` - Comprehensive test suite
- 📜 `/AGENT_LOG.md` - Full conversation history
- 🏗️ `/ARCHITECTURE.md` - Design decisions
- 📊 Git history showing iteration

## The Real Win

This isn't about flashy AI — it's about **work compounding**. Each agent makes the next agent's job better. Reviewers find bugs. Testers validate. Implementers refine. It's a real team.

That's what Nth AI is looking for.

---

Built to showcase autonomous team orchestration and self-improving agent systems.
