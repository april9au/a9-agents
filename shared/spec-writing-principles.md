<!--
  CANONICAL SOURCE — April9 Spec Writing Principles (shared/spec-writing-principles.md).
  sync-agents.js inlines this file into referencing agents/commands at sync time.
  Edit ONLY this file to change the principles; never edit the expanded copies in ~/.claude.
-->

### I. Spec File Audience Separation (NON-NEGOTIABLE)
Every spec file MUST declare its audience at the top using a feature-type banner: `[Portal Feature]` for client-facing features; `[Back-office Feature]` for system administrator features (or equivalent labels for the project). Client-facing user stories and admin configuration stories MUST NOT appear in the same spec file.

### II. Verb-Led User Story Titles (NON-NEGOTIABLE)
All user story headings MUST begin with a gerund verb (e.g. "Viewing…", "Setting Up…", "Preventing…"). Noun-phrase titles (e.g. "Report Menu Configuration", "Access Inheritance") are not permitted and must be rewritten.

### III. Task-Oriented Language for All Personas
User story titles and prose MUST be task-focused and readable regardless of audience. System-focused or technical titles must be rewritten as human tasks — administrators are users too. Example: "Record Synchronisation" → "Applying Changes in a Single Save".

### IV. Out of Scope vs Edge Cases
Every spec MUST include an explicit "Out of Scope" section that states what this feature intentionally does not cover.

Before recording any scenario, apply this decision rule:
- If the scenario has a defined system response → it is a **requirement**. Write it as a Functional Requirement and acceptance scenario. It MUST NOT appear as an edge case.
- If the scenario is intentionally not handled → it is **out of scope**. Add it to the Out of Scope section. It MUST NOT appear as an edge case.

An Edge Cases section is only permitted for scenarios satisfying **both**:
1. The event is genuinely unlikely in normal operation.
2. The implementation cost to fully resolve it is disproportionate to its impact.

A scenario with a fully specified outcome is a requirement regardless of how unlikely it is. An edge case with no resolution is an unresolved requirement — these MUST NOT be left open in a completed spec. Out of Scope and edge cases MUST NOT be conflated in the same section.

### V. Personas Established First, Used Throughout (NON-NEGOTIABLE)
All named personas (e.g. "Agency Employee", "System Administrator") MUST be defined once at the start of the feature specification suite before any user stories are written. Every user story MUST reference a defined persona by its canonical name — no synonyms, no generic "user" or "admin" references. Acceptance scenarios MUST use the same canonical persona names in Given/When/Then statements. New personas MUST NOT be introduced mid-spec without being added to the master persona list first.

### VI. Declared Reader Audience (NON-NEGOTIABLE)
Every spec file MUST declare its intended reader audience in the Overview section. Audience options: **business client (non-technical)**, **client IT team**, or **mixed**. The level of technical explanation, jargon, and parenthetical definitions throughout the spec MUST be calibrated to the declared audience.

- **Business client:** Avoid acronyms and technical terms without plain-English parentheticals. Explain concepts on first use. Prefer concrete examples over abstract descriptions.
- **Client IT team:** Technical terms and acronyms may be used with a single brief parenthetical on first use. Implementation-neutral language still applies — do not reference specific technologies unless they are stakeholder-specified constraints.
- **Mixed:** Apply business-client rules throughout; provide a glossary or parentheticals wherever a term could be opaque to the non-technical reader.

A spec that declares a non-technical audience but uses unexplained technical terms is a violation of these principles.

### VII. System-Scoped Personas (NON-NEGOTIABLE)
Every persona defined in a spec MUST belong to the system declared by the feature-type banner (Principle I). A `[Portal Feature]` spec MUST only define/reference personas who interact with the portal (e.g. end users, students, site visitors). A `[Back-office Feature]` spec MUST only define/reference personas who interact with the back-office system (e.g. content managers, system administrators).

A persona who belongs to one system MUST NOT appear in a spec for another system, even in a shared monorepo/repository. Cross-system features MUST be split into two separate spec files, one per system, each scoped to its own personas. The two specs MUST cross-reference each other in their Assumptions section (e.g. "Related spec: `specs/###-feature-name-backoffice/spec.md`").

If a persona's system boundary is ambiguous, it MUST be resolved before `/speckit.plan`. A persona operating in both systems MUST be split into system-specific variants with distinct canonical names (e.g. "Portal Student" and "Back-office Content Manager", not a generic "User").
