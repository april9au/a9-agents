---
name: stack9-v3-migrate
description: Migrate Stack9 v3 projects to v5+. Handles entities, entity hooks, API functions → webhooks, cron jobs, automations, query library, screens, and app navigation. Supports in-project migration or cross-project source→target migration.
user-invocable: true
---

# Stack9 v3 → v5 Migration Skill

## Overview

This skill migrates Stack9 v3 artifacts to v5+ structure. Before starting, read the reference files relevant to what you're migrating.

| Migrating | Reference |
|---|---|
| Project structure, package names, directory mapping | [references/overview.md](references/overview.md) |
| Entity JSON definitions | [references/entities.md](references/entities.md) |
| Workflow functions → entity hooks | [references/entity-hooks.md](references/entity-hooks.md) |
| API functions → action types + webhook automations | [references/api-functions.md](references/api-functions.md) |
| Cron jobs | [references/cron-jobs.md](references/cron-jobs.md) |
| Automation JSON | [references/automations.md](references/automations.md) |
| Query library (new in v5) | [references/queries.md](references/queries.md) |
| Screen JSON (new in v5) | [references/screens.md](references/screens.md) |
| App / navigation structure | [references/apps-navigation.md](references/apps-navigation.md) |
| Migration checklist template | [references/checklist.md](references/checklist.md) |

## Checklist — read this first

**Before doing anything else**, check whether `migration-checklist.md` exists in the target project root:

- **If it exists**: read it to determine what's already done. Skip completed sections (marked `[x]`). Resume from the first unchecked item.
- **If it does not exist**: create it now using the template in [references/checklist.md](references/checklist.md), filling in the source path, target path, and today's date.

After completing each migration section, **you must update the checklist immediately** — tick the relevant checkbox (`- [ ]` → `- [x]`) by editing `migration-checklist.md` before moving to the next step. Do not batch updates. Do not skip this step even if the section was trivial. The checklist is the only persistent state between sessions.

## Operating Modes

### Mode 1 — Same-project migration
When invoked without arguments (or with just `--source`), you are working within a single v5 project. Read v3 artifacts from the source path and write v5 artifacts into the current project's `packages/stack9-stack/src/` structure.

### Mode 2 — Cross-project migration
When invoked with both `--source <v3-path>` and `--target <v5-path>`, read v3 artifacts from `<v3-path>/stack9/server/` and write v5 artifacts into `<v5-path>/packages/stack9-stack/src/`.

## Migration Workflow

Follow this order strictly — later steps depend on earlier ones:

```
Step 1. Analyse source project
  └─ Read stack9/server/entities/custom/
  └─ Read stack9/server/workflow-functions/
  └─ Read stack9/server/api-functions/
  └─ Read stack9/server/cron-jobs/
  └─ Read stack9/server/app.json (apps, cronJobs)

Step 2. Migrate entities
  └─ Copy entity JSON to target entities/custom/
  └─ Strip inline hooks[] references (move to entity-hooks instead)
  └─ Strip formLayout — in v5 form layout is defined in screen JSON, not entities
  └─ Preserve fields, gridSettings, workflowDefinition

Step 3. Migrate entity hooks (workflow-functions → entity-hooks)
  └─ For each entity directory in workflow-functions/custom/, inspect which files exist:

  validateAndTransform.ts only:
    └─ Convert to {entity}.vat.ts in entity-hooks/
    └─ Export from entity-hooks/index.ts

  afterSave.ts only:
    └─ Do NOT create a .vat.ts — v5 has no afterSave hook trigger
    └─ Instead: create an action type + afterUpdate automation (see Step 4 pattern)
    └─ The automation triggerType should be "afterUpdate" unless the logic
       can only ever apply at create-time, in which case use "afterCreate"
    └─ To decide: read the afterSave logic — if it guards on a status field
       or a field that can only be set via update (e.g. "Submitted"), afterUpdate is correct
    └─ If the logic could plausibly run on a freshly created record, add both
       afterCreate and afterUpdate automations pointing to the same action type

  both validateAndTransform.ts and afterSave.ts:
    └─ Create {entity}.vat.ts for the validateAndTransform logic
    └─ Create a separate action type + automation for the afterSave logic (see above)

  Neither file (empty directory):
    └─ Skip — no hook needed

Step 4. Migrate API functions → action types + webhook automations
  └─ Convert each api-function class → action type class
  └─ Create matching webhook automation JSON
  └─ Update action-types/index.ts exports

Step 5. Migrate cron jobs → action types + AWS EventBridge schedulers
  └─ Convert each cron-job class → action type class (same pattern as api-functions)
  └─ Add an entry to apps/app-aws-cloud/src/lib/event-schedulers.ts (TEventSchedulers)
  └─ messageBody.queue must match the action type description.key exactly
  └─ Convert v3 cronTime (standard cron) → AWS cron syntax: cron(min hour day month ? year)
  └─ Update action-types/index.ts exports
  └─ Do NOT create automation JSON or add cronJobs to app.json — EventBridge handles scheduling

Step 6. Create query library (new in v5)
  └─ For each entity: list, detail, create, update, delete queries
  └─ For relation fields: dropdown queries

Step 7. Create screens (new in v5)
  └─ For each entity: one simpleCrud screen (list + create + update in one file)
  └─ Do NOT use listView + detailView pairs — they have no create button
  └─ Navigation links must point to /{app}/{route}/list (simpleCrud sub-route)
  └─ Register queries in each screen's queries[]

Step 8. Migrate app navigation
  └─ Convert app.json apps[] → separate apps/*.json files
  └─ Convert menu/item_groups structure → nodeType children structure
  └─ Convert Font Awesome icons → Ant Design icon names

Step 9. Port database migrations
  └─ List all files in {source}/database/migrations/
  └─ Convert each from CJS (module.exports = { up, down }) → ESM (export async function up(knex: Knex))
  └─ If migration reads SQL from a scripts/ directory: inline each SQL file as a knex.raw() call — do NOT copy the scripts/ directory (it won't be included in the build output)
  └─ Each migration must be fully self-contained (no external file reads at runtime)

Step 10. Generate models
  └─ Run: yarn workspace stack9-stack generate-models
  └─ Check for ESLint errors — native entities (e.g. user_group) are not auto-generated
  └─ For any missing native model, manually create src/models/stack9/{NativeEntity}.ts
      using z.object({}) with the fields referenced, matching the Zod pattern of generated models

Step 11. Update index.ts registration
  └─ Ensure all action types and entity hooks are exported
  └─ registerClass({ ...events, ...actionTypes, ...entityHooks }) in index.ts

Step 12. Validate
  └─ Run: yarn workspace stack9-stack validate
```

## Pre-flight: validator setup

Before starting migration, ensure the validator is configured in the target project:

1. Read `packages/stack9-stack/package.json`
2. Check if `"validate": "stack9-validators"` exists in `scripts`
3. Check if `@april9au/stack9-validators` exists in `devDependencies`

If either is missing, fix them:

```bash
# Add the validate script if missing (edit package.json directly)
# Add the devDependency via yarn — match the version of @april9au/stack9-sdk already in the file
yarn workspace stack9-stack add -D @april9au/stack9-validators@<same-version-as-sdk>

# Then install
yarn
```

To find the correct version, read `packages/stack9-stack/package.json` and use the same version string as `@april9au/stack9-sdk` in `dependencies`.

After installing, verify it works:
```bash
yarn workspace stack9-stack validate
```

## Agent Delegation

Use the **stack9-developer** agent for any Stack9-specific implementation work during migration — entities, queries, screens, automations, entity hooks, action types, app navigation, and anything else Stack9-related. It has deep knowledge of the Stack9 platform and should be your first choice for delegating implementation tasks.

## Constraints

- **Do not add or remove functionality** — only adapt structure to v5
- **Preserve all business logic** exactly as found in v3
- **Never use `any` for typing** — derive correct types from entity models
- **Always update index.ts** when adding action types or entity hooks
- **Run validate after each step** to catch schema errors early
- For MCP docs: use `mcp__stack9-docs__vector-search` for anything not covered by references

## Validate command

After writing files, run:
```bash
yarn workspace stack9-stack validate
```
