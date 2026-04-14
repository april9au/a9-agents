---
name: spec-guard
description: Validate the current implementation against the speckit spec and tasks, surfacing gaps, drift, and incomplete requirements before marking a feature done.
---

Run this after speckit implement to verify what was built matches what was specced.

## Steps

### 1. Load the spec and tasks

- Locate the current spec via `.specify/scripts/bash/check-prerequisites.sh --json --paths-only`
- Read the spec file (spec.md) in full
- Read the speckit tasks file
- If `spec.json` exists alongside `spec.md`, prefer it for structured requirement extraction

### 2. Load ARCHITECTURE.md

Read `.specify/ARCHITECTURE.md` if it exists. Use this to understand what patterns must be respected and what integration points must be intact — not just whether the new feature was implemented, but whether it was implemented correctly relative to the existing system.

### 3. Identify what was implemented

Get the git diff of files changed during the implement session to understand what was actually built and where.

### 4. Validate using code-reviewer agent

Delegate to the `code-reviewer` agent with the spec, tasks, ARCHITECTURE.md, and the diff. Ask it to check each:

- **Functional requirement** — is there corresponding code that satisfies it?
- **User story acceptance scenario** — does the implementation cover the given/when/then?
- **Edge case** — is each listed edge case handled in the code?
- **Speckit task** — is each task reflected in the diff?
- **Architecture conformance** — does the implementation follow established patterns from ARCHITECTURE.md?

### 5. Produce a gap report

Output a report with three sections:

**Implemented** — requirements with clear implementation evidence (cite file + behaviour)

**Partial** — requirements with incomplete coverage (cite what is present and what is missing)

**Missing** — requirements with no implementation found

**Architecture drift** — any deviations from established patterns in ARCHITECTURE.md

### 6. Recommend next action

- If all requirements are met and no drift: suggest `/test-fix-loop` then `/post-implement`
- If gaps or drift found: list specific items and ask the user whether to continue implementing or accept the delta
