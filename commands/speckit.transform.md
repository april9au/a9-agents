---
description: Transform a Feature Specification Markdown file into a structured spec.json file following the canonical JSON schema.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty). If the user provided a path to a spec file, use that path directly and skip the branch-based path resolution.

## Outline

Transform a `spec.md` file into a `spec.json` file placed alongside it in the same directory.

### 1. Resolve the spec file path

**If the user provided a path in `$ARGUMENTS`**:

- Use that path as `FEATURE_SPEC` directly.
- Derive `FEATURE_DIR` as its parent directory.

**If no path was provided**:

- Run `.specify/scripts/bash/check-prerequisites.sh --json --paths-only` from repo root and parse the JSON output.
- Extract `FEATURE_SPEC` and `FEATURE_DIR` from the result.
- If the script fails, instruct the user to either pass the spec file path as an argument or check out the correct feature branch.

### 2. Read the spec file

Load the full contents of `FEATURE_SPEC`. If the file does not exist, abort with:

> ERROR: Spec file not found at `<path>`. Run `/speckit.specify` to generate one, or pass the correct path as an argument.

### 3. Parse the spec into the JSON schema

Extract each section from the Markdown and map it to the JSON schema defined below. Follow all parsing rules precisely.

**Parsing rules**:

- **feature_description**: Generate a concise 1–2 sentence description from the document title and the `**Input**` front-matter line (if present). Capture the *what* and *why* of the feature in plain language for non-technical readers. Do not copy the raw input verbatim — synthesize it.
- **user_stories**: Parse every `### User Story N` subsection from `## User Scenarios & Testing`. For each story:
  - `id`: Derive as `"US-<N>"` (e.g., `"US-1"`).
  - `title`: The text after `### User Story N - ` on the heading line.
  - `priority`: Read from `(Priority: P<N>)` on the heading line.
  - `description`: The narrative paragraph(s) before the bold sub-labels.
  - `why_this_priority`: Text after `**Why this priority**:`.
  - `independent_test`: Text after `**Independent Test**:`.
  - `acceptance_scenarios`: Each numbered item under `**Acceptance Scenarios**`. For each scenario, split on `**Given**`, `**When**`, `**Then**` keywords and populate `given`, `when`, `then` fields. Assign `id` as the ordinal integer.
- **edge_cases**: Parse every bullet from the `### Edge Cases` subsection. For each bullet:
  - `id`: Assign sequentially as `"EC-<N>"` (e.g., `"EC-1"`).
  - `scenario`: The question or condition described (text before the parenthetical resolution, if any).
  - `resolution`: The resolution text in parentheses, or after a dash/colon if no parentheses. If none found, use `null`.
- **functional_requirements**: Parse every bullet from `### Functional Requirements`. For each bullet:
  - `id`: The bold identifier (e.g., `"FR-001"`). Preserve suffixes like `"FR-003a"`.
  - `requirement`: Full requirement text after the identifier, stripped of leading colon/dash.
- **key_entities**: Parse every bullet from `### Key Entities`. For each bullet:
  - `name`: The bold entity name before the colon.
  - `description`: Full description text after the colon.
- **success_criteria**: Parse every bullet from `### Measurable Outcomes`. For each bullet:
  - `id`: The bold identifier (e.g., `"SC-001"`).
  - `criterion`: Full criterion text after the identifier.
- **clarification_sessions**: Parse every `### Session YYYY-MM-DD` subsection under `## Clarifications`. For each session:
  - `session_date`: The date from the heading (ISO format).
  - `clarifications`: Each `- Q: ... → A: ...` bullet. Split on ` → ` to produce `question` and `answer` fields.
- **assumptions**: Parse every bullet from `## Assumptions`. For each bullet:
  - `id`: Assign sequentially as `"AS-<N>"`.
  - `assumption`: Full assumption text.

### 4. Build the JSON object

Construct the JSON object using the schema below. **Always include every top-level array defined in the schema**, even if the corresponding section is missing or empty in the spec — use an empty array (`[]`) in that case. Preserve the order of items as they appear in the source spec.

```json
{
  "feature_branch": "<string>",
  "feature_description": "<string — concise 1-2 sentence synthesis>",
  "created_at": "<YYYY-MM-DD>",
  "status": "<string>",
  "user_stories": [
    {
      "id": "<string — e.g. US-1>",
      "title": "<string>",
      "priority": "<string — e.g. P1>",
      "description": "<string>",
      "why_this_priority": "<string>",
      "independent_test": "<string>",
      "acceptance_scenarios": [
        {
          "id": "<integer>",
          "given": "<string>",
          "when": "<string>",
          "then": "<string>"
        }
      ]
    }
  ],
  "edge_cases": [
    {
      "id": "<string — e.g. EC-1>",
      "scenario": "<string>",
      "resolution": "<string | null>"
    }
  ],
  "functional_requirements": [
    {
      "id": "<string — e.g. FR-001>",
      "requirement": "<string>"
    }
  ],
  "key_entities": [
    {
      "name": "<string>",
      "description": "<string>"
    }
  ],
  "success_criteria": [
    {
      "id": "<string — e.g. SC-001>",
      "criterion": "<string>"
    }
  ],
  "clarification_sessions": [
    {
      "session_date": "<YYYY-MM-DD>",
      "clarifications": [
        {
          "question": "<string>",
          "answer": "<string>"
        }
      ]
    }
  ],
  "assumptions": [
    {
      "id": "<string — e.g. AS-1>",
      "assumption": "<string>"
    }
  ]
}
```

### 5. Validate the JSON

Before writing, verify:

- The JSON is syntactically valid (no trailing commas, all strings properly escaped, no unquoted keys).
- Every `acceptanceScenario` has non-empty `given`, `when`, and `then` fields. If a scenario cannot be cleanly split, place the full text in `given` and leave `when` and `then` as empty strings.
- No `[NEEDS CLARIFICATION]` markers remain anywhere in string values — if found, include them verbatim so they remain visible in the output for downstream review.
- All `id` fields are unique within their respective arrays.
- String values containing double quotes use JSON escape sequences (`\"`).
- Multiline spec text is collapsed to a single line per field (replace line breaks with a single space), preserving paragraph breaks as ` \n\n ` only when meaning would otherwise be lost.

### 6. Write the output file

Determine the output path:

```
SPEC_JSON = <FEATURE_DIR>/spec.json
```

Write the fully constructed and validated JSON object to `SPEC_JSON` with 2-space indentation.

### 7. Report completion

Output a brief summary:

- Path to `spec.json`
- Count of items extracted per section (e.g., `userStories: 3, edgeCases: 6, ...`)
- Any fields that were missing from the source spec (omitted sections)
- Suggested next command if applicable

## General Guidelines

- Parse the Markdown structurally — do not summarize, paraphrase, or add information that is not present in the source file.
- The only exception is `featureDescription`, which must be a synthesized summary (see parsing rules above).
- Preserve all identifiers (`FR-001`, `SC-001`, etc.) exactly as written.
- Do not invent data for missing sections — simply omit the corresponding array.
- For single quotes in shell arguments, use escape syntax: `'I'\''m Groot'` (or double-quote the whole string when possible).
- Always use absolute paths when running shell scripts.
