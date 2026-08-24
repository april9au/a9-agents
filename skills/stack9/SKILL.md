---
name: stack9
description: Stack9 full-stack development patterns — entities, queries, screens, automations, React frontend, and entity hooks. Use when building any Stack9 feature.
user-invocable: false
hooks:
  PostToolUse:
    - matcher: Write|Edit
      hooks:
        - type: command
          command: bash "${CLAUDE_SKILL_DIR}/scripts/validate.sh"
          statusMessage: Validating Stack9 schemas...
---

Think in **features, not layers**. Own the full vertical slice from entity definition through to React UI. Never ask the user to handle one part separately.

## Feature decomposition

```
Feature Request
  └─ Data model needed?          → entities/custom/
  └─ Data fetching or mutation?  → query-library/
  └─ Screen config needed?       → screens/
  └─ Custom UI required?         → apps/stack9-frontend/src/pages/ or components/
  └─ Business logic/validation?  → entity-hooks/
  └─ Automated side effects?     → automations/
  └─ Navigation update?          → apps/
```

## Load the relevant reference

Read only what the current task requires:

| Building | Reference file |
|---|---|
| Entity definitions, fields, relationships | [references/entity-schema.md](references/entity-schema.md) |
| Queries — list, detail, mutations, raw SQL | [references/query-patterns.md](references/query-patterns.md) |
| Screen JSON — listView, detailView, navigation | [references/screen-schema.md](references/screen-schema.md) |
| React components, hooks, mutations, registration | [references/react-patterns.md](references/react-patterns.md) |
| Automations and workflow triggers | [references/automation-schema.md](references/automation-schema.md) |
| Entity hooks — validation, computed fields | [references/entity-hook-patterns.md](references/entity-hook-patterns.md) |

For anything not covered by these references, query the `mcp__stack9-docs__vector-search` MCP tool.

## Critical rules

**Never bypass the query system:**
- Fetching data in render → `useScreenQuery()` or `useScreenQueryById()` from `@april9/stack9-ui`
- Mutations in event handlers → `queryService.runNamedQuery(screenKey, queryName, { vars })` from `useStack9()`
- Never use `fetch()`, `axios`, or direct API calls

**Always include `_is_deleted: false` in `stack9_api` WHERE clauses.** All Stack9 entities support soft delete.

**Use the right connector:**
- Entity CRUD → `stack9_api` (preserves hooks, validation, audit trail)
- Aggregations, dashboards, cross-entity reports → `stack9_db`

**Never edit auto-generated files:**
- `packages/stack9-models/models/` — overwritten by `yarn generate-models` (run from the project root), shared between `stack9-stack` and `stack9-frontend` via the `stack9-models` workspace package

**Run `yarn generate-models` before writing any frontend components** so generated types are available.

## Delivery checklist

- [ ] Entity JSON created/updated in `entities/custom/`
- [ ] Query JSON files in `query-library/` (list, detail, create, update, delete as needed)
- [ ] Screen JSON in `screens/`
- [ ] `yarn workspace stack9-stack validate` passes
- [ ] `yarn generate-models` run before writing frontend components
- [ ] App navigation updated in `apps/{app}.json` if new screens added
- [ ] Entity hook in `entity-hooks/` if validation or business logic needed
- [ ] Automation in `automations/` if side effects needed
- [ ] DB migration in `database/migrations/` if schema changes
- [ ] React components in `pages/` or `components/` if custom UI needed
- [ ] Custom routes registered in `app.stack9.instance.tsx` if custom pages added
