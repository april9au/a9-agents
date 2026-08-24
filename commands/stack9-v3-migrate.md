---
name: stack9-v3-migrate
description: Migrate Stack9 v3 artifacts to v5+. Supports in-project or cross-project (--source / --target) migration of entities, entity hooks, API functions, cron jobs, queries, screens, and navigation.
user-invocable: true
---

# /stack9-v3-migrate

Migrates Stack9 v3 artifacts to v5+ structure.

## Usage

```
/stack9-migrate
/stack9-migrate --source /path/to/v3-project
/stack9-migrate --source /path/to/v3-project --target /path/to/v5-project
/stack9-migrate --entity <entity_key>
/stack9-migrate --source /path/to/v3-project --entity <entity_key>
```

## Mode Detection

Parse the user's message to determine the operating mode:

**Mode 1 — Current project** (no `--source` or `--target`):
- Source: infer the v3 source from the current working directory (look for `stack9/server/`)
- Target: the current project's `packages/stack9-stack/src/`

**Mode 2 — Source only** (`--source <path>`):
- Source: `<path>/stack9/server/`
- Target: the current project's `packages/stack9-stack/src/`

**Mode 3 — Source + target** (`--source <path> --target <path>`):
- Source: `<source>/stack9/server/`
- Target: `<target>/packages/stack9-stack/src/`

**`--entity` flag** (optional):
- Only migrate the specified entity and its related artifacts (queries, screens, hooks). Skip all others.

## Step 1 — Load the skill

Load the skill at `.claude/skills/stack9-v3-migrate/SKILL.md` in the current project.

## Step 2 — Analyse source

Before migrating, read the source project to understand what needs to be migrated:

1. List all files in `{source}/stack9/server/entities/custom/`
2. List all files in `{source}/stack9/server/workflow-functions/`
3. List all files in `{source}/stack9/server/api-functions/`
4. List all files in `{source}/stack9/server/cron-jobs/`
5. Read `{source}/stack9/server/app.json` for apps and cronJobs
6. Report a summary of what was found before starting

If `--entity` is specified, filter to only that entity and its direct dependencies.

## Step 3 — Confirm scope

Before writing any files, present the migration plan to the user:
- Entities to migrate
- Entity hooks to create
- Action types to create (from api-functions + cron-jobs)
- Webhook automations to create
- Queries to create
- Screens to create
- App navigation changes

Ask for confirmation before proceeding.

## Step 4 — Execute migration

Follow the 10-step workflow from `SKILL.md`, reading each relevant reference file before that step.

After writing files for each step:
1. Run `yarn workspace stack9-stack validate` and fix any errors before proceeding.
2. **Immediately edit `migration-checklist.md`** to tick the completed section's checkbox (`- [ ]` → `- [x]`). Do not skip this — it is the only state that persists across sessions.

## Step 5 — Report

Summarise what was migrated:
- Files created
- Any manual steps required (e.g., run `yarn generate-models`, update imports)
- Any v3 patterns that could not be automatically migrated

## Important notes

- **Do not add or remove functionality** — only adapt structure to v5
- **Preserve all business logic** exactly as found in v3
- If a v3 pattern has no direct v5 equivalent, note it and ask the user how to proceed
- Always run `yarn workspace stack9-stack validate` after each step
