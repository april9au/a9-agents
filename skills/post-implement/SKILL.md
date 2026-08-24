---
name: post-implement
description: Update the project's architecture history after a speckit implement session, capturing what was built, key decisions, and patterns established for future features.
---

Run this after speckit's implement step completes. Keeps `.specify/ARCHITECTURE.md` current so future features have accurate context.

## Steps

### 1. Load context

- Get the git diff of changes made during the implement session (`git diff HEAD` for uncommitted or `git diff main...HEAD` for committed work)
- Read the current spec file from `.specify/` (use `check-prerequisites.sh --json --paths-only` to locate it, or find the spec.md matching the current branch)
- Read the speckit tasks file to understand what was completed vs deferred

### 2. Extract implementation knowledge

Delegate to the `docs-architect` agent with the diff, spec, and tasks. Ask it to extract:

- **What was built** — new files, modules, components and their purpose
- **Key decisions** — architectural choices made (patterns selected, data structures used, integration approaches taken, and why)
- **Patterns established** — conventions introduced that future features should follow
- **Integration points** — how this feature connects to existing code (APIs called, events emitted, shared state modified, types extended)
- **Known limitations** — anything explicitly deferred, out of scope, or flagged as tech debt

### 3. Update ARCHITECTURE.md

Read existing `.specify/ARCHITECTURE.md` (or create it if this is the first tracked feature).

Append a new dated section in this format:

```markdown
## [Feature Name] — YYYY-MM-DD

**What was built**: [summary]

**Key decisions**:
- [decision and rationale]

**Patterns established**:
- [pattern description — e.g. "all new API routes use X middleware pattern"]

**Integration points**:
- [what connects to what]

**Known limitations**:
- [deferred items or tech debt]
```

Write the updated file to `.specify/ARCHITECTURE.md`.

### 4. Confirm

Report to the user:
- Path to updated ARCHITECTURE.md
- Feature name and date recorded
- Count of decisions and patterns captured
- Suggest running `/spec-guard` if not already done to validate completeness
