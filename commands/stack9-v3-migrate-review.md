---
name: stack9-v3-migrate-review
description: Post-migration review for Stack9 v3 → v5. Audits source vs target to find anything missed, then reports a gap list.
user-invocable: true
---

# /stack9-v3-migrate-review

Cross-checks the v3 source against the v5 target to find anything that was not migrated.

## Usage

```
/stack9-review
/stack9-review --source /path/to/v3-project
/stack9-review --source /path/to/v3-project --target /path/to/v5-project
```

## Mode Detection

Same as `/stack9-migrate`:

- No args: source = current project's `stack9/server/`, target = current project's `packages/stack9-stack/src/`
- `--source`: source = `<path>/stack9/server/`, target = current project's `packages/stack9-stack/src/`
- `--source + --target`: source = `<source>/stack9/server/`, target = `<target>/packages/stack9-stack/src/`

## Review Steps

Run all checks, then produce a single gap report at the end.

---

### 1. Entities

- List all JSON files in `{source}/entities/custom/`
- List all JSON files in `{target}/entities/custom/`
- **Gap**: any source entity not present in target
- For each entity JSON in target:
  - Check that the `hooks` key is absent or empty — if it still contains entries, flag it (hooks are registered via entityName convention, not entity JSON)

---

### 2. Entity Hooks (workflow-functions)

- List all subdirectories in `{source}/workflow-functions/custom/` (each directory = one entity)
- List all `*.vat.ts` files in `{target}/entity-hooks/`
- **Gap**: any source entity directory that has no matching `.vat.ts` in target
- For each `.vat.ts` in target:
  - Check that `entityName` property is set
  - Check that the file is exported from `entity-hooks/index.ts`

---

### 3. API Functions → Action Types + Webhook Automations

- List all `.ts` files in `{source}/api-functions/`
- For each source api-function:
  - Check that a corresponding class exists in `{target}/action-types/`
  - Check that a corresponding `webhook_*.json` exists in `{target}/automations/`
- **Gap**: any api-function with no action type or no webhook automation

---

### 4. Cron Jobs → Action Types + EventBridge Schedulers

- List all `.ts` files in `{source}/cron-jobs/`
- For each source cron-job:
  - Check that a corresponding action type class exists in `{target}/action-types/`
  - Check that `apps/app-aws-cloud/src/lib/event-schedulers.ts` exists in the target project root
  - Check that `event-schedulers.ts` contains an entry whose `messageBody.queue` matches the action type key
- **Gap**: any cron-job with no action type, or no matching EventBridge scheduler entry

---

### 5. index.ts Registration

- Read `{target}/action-types/index.ts`
  - Check every action type class file in `action-types/` is exported
- Read `{target}/entity-hooks/index.ts`
  - Check every `.vat.ts` file in `entity-hooks/` is exported
- Read `{target}/../index.ts` (the package root index.ts)
  - Check that `registerClass` spreads both `...actionTypes` and `...entityHooks`
- **Gap**: any file that exists but is not exported or registered

---

### 6. Automations

- For each webhook automation JSON in `{target}/automations/`:
  - Check that the `actionTypeKey` referenced in `actions[]` matches a key in an existing action type class
- **Gap**: any automation referencing a non-existent action type key

---

### 7. App Navigation

- Read `{source}/app.json` — check `apps[]` array
- List `*.json` files in `{target}/apps/`
- **Gap**: any v3 app entry with no matching file in `{target}/apps/`

---

### 8. Models

- Check whether `{target}/models/stack9/` contains any `.ts` files
- If empty or missing: flag that `yarn workspace stack9-stack generate-models` has not been run
- **Gap**: missing generated models

---

### 9. Validator

Run:
```bash
yarn workspace stack9-stack validate
```

Report pass or fail. If it fails, include the output.

---

### 10. Migration Checklist

- Read `migration-checklist.md` from the target project root
- List any checkboxes that are still unchecked (`- [ ]`)
- **Gap**: any unchecked items

---

## Output Format

Produce a single report with two sections:

### All clear
List each check that passed with a one-line confirmation.

### Gaps found
For each gap, output:
- Which check it came from
- What is missing (file name, key, etc.)
- What action is needed to fix it

If there are no gaps, say so explicitly and confirm the migration is complete.

Do not fix anything — this command only reviews and reports.
