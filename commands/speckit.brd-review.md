---
description: Review a SpecKit feature specification (spec.md) against April9's Spec Writing Principles and produce a per-principle BRD review report. Run on request when a BRD needs a documentation-quality review — optionally as a manual check before /speckit.plan.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty). If the user provided a path to a spec file or a feature directory, use it directly and skip branch-based path resolution. If the user asked you to **apply fixes** (e.g. "and fix the titles"), switch from report-only to edit mode for the requested findings only.

## Outline

Review a `spec.md` against **April9's Spec Writing Principles** (the seven principles below) and emit a structured review report. This reviews the *documentation quality* of the spec — it is separate from the SpecKit constitution, which governs technical decisions during plan and implementation. Run this command **on request** when a BRD needs a documentation review — most naturally as an optional manual check after `/speckit.clarify` and before `/speckit.plan`, when the user wants one. It is not a mandatory step that fires automatically before planning.

By default this command **reports; it does not edit the spec**. Only modify spec files when the user explicitly requests fixes. The review report itself is always persisted: every run ends by writing `<NNN>-brd-review.md` into the reviewed spec's folder (step 7).

### 1. Resolve the spec file path

**If the user provided a path in `$ARGUMENTS`:**
- If it points to a `spec.md`, use it as `FEATURE_SPEC` and its parent as `FEATURE_DIR`.
- If it points to a directory, use `<dir>/spec.md` as `FEATURE_SPEC`.

**If no path was provided:**
- Run `.specify/scripts/bash/check-prerequisites.sh --json --paths-only` from repo root and parse the JSON output.
- Extract `FEATURE_SPEC` and `FEATURE_DIR` from the result.
- If the script fails, instruct the user to either pass the spec file path as an argument or check out the correct feature branch.

### 2. Establish suite context (required for Principles V & VII)

Principles V (canonical personas) and VII (system-scoped personas) are **cross-file**. Before judging them:

- List sibling feature directories under `specs/` (e.g. `specs/*/spec.md`).
- Read the persona definitions and feature-type banners of sibling specs that belong to the same feature suite.
- Build the **canonical persona list** and note each spec's system (portal vs back-office).

State in the report whether you reviewed a **single file** or the **suite**.

### 3. Read the spec file

Load the full contents of `FEATURE_SPEC`. If the file does not exist, abort with:

> ERROR: Spec file not found at `<path>`. Run `/speckit.specify` to generate one, or pass the correct path as an argument.

### 4. Run the seven-principle review

Judge each principle **PASS / FAIL / N/A**. Judge against these principles — **not** against the `spec.json` transform schema, which omits several mandated sections.

{{include:shared/spec-writing-principles.md}}

Operational notes for the review:

- **II / III:** flag every noun-phrase or system/technical title and provide a compliant, paste-ready rewrite.
- **IV:** run the 3-way classifier on every Edge Cases item (requirement / out of scope / genuine edge case) and flag any unresolved edge case or conflated section.
- **VII:** flag ambiguous or dual-system personas for resolution before `/speckit.plan`.

### 5. Classify findings

- **Blocking:** any violation of a NON-NEGOTIABLE principle (I, II, V, VI, VII), plus any Principle III/IV issue that leaves a requirement unresolved or miscategorised. These block `/speckit.plan`.
- **Non-blocking:** style and readability suggestions that do not breach a rule.

Rank blocking issues first.

### 6. Emit the review report

```
# BRD Review — <feature name / spec path>
Reviewed: <date>
Scope reviewed: <single file | suite of N specs>
Lifecycle position: optional review before /speckit.plan (run on request)

## Verdict: PASS ✅ | CHANGES REQUIRED ❌
<one-line summary of principles passed/failed>

## Per-principle findings
### I. Audience Separation — PASS/FAIL/N/A
- <finding> (location: <section/heading/line>)
  Fix: <concrete action or rewrite>
### II. Verb-Led Titles — …
| Current title | Compliant rewrite |
|---|---|
… III–VII …

## Miscategorised scenarios (Principle IV)
| Scenario | Currently in | Should be | Why |
|---|---|---|---|

## Persona consistency (Principles V & VII)
- Canonical persona list: <names>
- Deviations: <file → reference → canonical name>
- Cross-system concern: <split needed? cross-reference present?>

## Blocking issues (must fix before /speckit.plan)
1. …

## Non-blocking suggestions
- …
```

### 7. Persist the review report (ALWAYS)

Write the full report from step 6 to `FEATURE_DIR/<NNN>-brd-review.md`, where `<NNN>` is the spec folder's number prefix (e.g. `specs/004-report-menu/` → `004-brd-review.md`):

- The filename is always `<NNN>-brd-review.md` for that folder — **overwrite** any existing one so the file reflects the latest review (git history keeps prior runs).
- Suite reviews write one `<NNN>-brd-review.md` per reviewed spec folder, each holding that spec's findings plus any suite-wide persona/system findings affecting it.
- Stamp the report with the review date.
- If fixes were requested (step 8), write the report after re-verifying so it records the post-fix verdict.
- End your summary by stating where the report was saved.

Never skip this step, even on a clean PASS.

### 8. (Only if the user asked for fixes) Apply and re-verify

- Edit `FEATURE_SPEC` (and sibling specs where a cross-file principle requires it) to satisfy only the findings the user asked you to fix.
- Make minimal, intent-preserving edits — do not add, remove, or reshape requirements beyond what these principles require.
- Re-run the affected checks and confirm they now PASS in a short follow-up summary, then refresh `<NNN>-brd-review.md` (step 7).

## General Guidelines

- The rubric is these principles, not the `spec.json` schema. Never treat the transform schema's shape as the pass bar.
- Every finding must cite a location and offer a concrete, paste-ready fix. Vague advice is not a finding.
- Preserve authorial intent — fix compliance and clarity, never invent scope.
- When a persona's system boundary or a scenario's category is genuinely ambiguous, say so and recommend `/speckit.clarify` rather than guessing.
- Always use absolute paths when running shell scripts.
- For single quotes in shell arguments, use escape syntax: `'I'\''m Groot'` (or double-quote the whole string when possible).
