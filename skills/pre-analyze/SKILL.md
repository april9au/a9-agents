---
name: pre-analyze
description: Prime the implementation context by reading project architecture history and scoping the blast radius of the current spec before speckit analyze.
---

Run this before speckit's analyze step to surface existing patterns, integration points, and regression risks.

## Steps

### 1. Load the spec

Locate the current feature spec:
- Run `.specify/scripts/bash/check-prerequisites.sh --json --paths-only` from repo root and parse JSON output to extract `FEATURE_SPEC` and `FEATURE_DIR`
- If the script is not found or fails, look for a `spec.md` in `.specify/features/` matching the current branch name
- Read the spec file in full

### 2. Load project architecture history

Check for `.specify/ARCHITECTURE.md` at the repo root:
- If it exists, read it in full — this is the living record of previous implementation decisions
- If it does not exist, create it with the seed template below and note this is the first tracked feature

**Seed template** (use when file does not exist):

```markdown
# Architecture History

## Overview

_Brief description of the project and its primary technical stack._

## Established Patterns

_Patterns that must be followed for consistency. Updated after each feature._

## Feature History

_One entry per implemented feature, added by the post-implement skill._
```

### 3. Identify blast radius

Based on the spec's key entities, functional requirements, and affected areas:
- Search the codebase for files related to each key entity named in the spec
- Identify existing implementations the new feature must integrate with or modify
- Note shared utilities, types, services, or data models that are in scope

### 4. Surface risks using architect-review agent

Delegate to the `architect-review` agent with the spec content, ARCHITECTURE.md content, and the list of in-scope files. Ask it to identify:
- Which existing behaviours could regress based on the spec's scope
- Which established patterns from ARCHITECTURE.md must be respected
- Any conflicts between what the spec asks for and what currently exists
- Integration points that require coordination with existing code

### 5. Output a primer

Produce a concise brief covering:

**In scope** — files and modules this feature will touch
**Patterns to follow** — established conventions from architecture history
**Regression risks** — existing behaviour that could break
**Recommended approach** — high-level implementation direction aligned with existing patterns

Ask the user to confirm before proceeding to speckit analyze.
