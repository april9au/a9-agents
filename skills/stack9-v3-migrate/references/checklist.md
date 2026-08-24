# Migration Checklist Template

When starting a migration, create `migration-checklist.md` at the root of the target project using this template. Update it as each step completes.

---

## Template

```markdown
# Stack9 Migration Checklist

Source: <!-- v3 project path -->
Target: <!-- v5 project path -->
Started: <!-- date -->

## Entities
- [ ] Entity JSON files copied and cleaned (hooks[] cleared)

## Entity Hooks
- [ ] Workflow functions converted to entity-hooks/*.vat.ts
- [ ] entity-hooks/index.ts updated with all exports

## API Functions → Action Types + Webhooks
- [ ] API functions converted to action-types/*.ts
- [ ] Webhook automation JSON created for each
- [ ] action-types/index.ts updated with all exports

## Cron Jobs → Action Types + EventBridge Schedulers
- [ ] Cron jobs converted to action-types/*.ts
- [ ] entries added to apps/app-aws-cloud/src/lib/event-schedulers.ts (TEventSchedulers)
- [ ] action-types/index.ts updated with all exports

## Query Library
- [ ] List queries created
- [ ] Detail queries created
- [ ] Create/update/delete queries created
- [ ] Dropdown queries created for relation fields

## Screens
- [ ] simpleCrud screens created (one per entity — covers list + create + update)
- [ ] formFieldset.create built from entity fields
- [ ] Queries registered in each screen's queries[]

## App Navigation
- [ ] App JSON files created in src/apps/
- [ ] v3 menu structure converted to nodeType children
- [ ] Font Awesome icons converted to Ant Design
- [ ] Screen routes wired to navigation links

## Database Migrations
- [ ] Migrations in `{source}/database/migrations/` ported to `{target}/database/migrations/` as ESM TypeScript (`export async function up(knex: Knex)`)
- [ ] Any SQL from `{source}/database/scripts/` inlined as `knex.raw()` calls — no scripts/ directory in target

## Models
- [ ] yarn workspace stack9-stack generate-models run
- [ ] Native entity models (e.g. UserGroup) manually created if referenced by generated models

## index.ts Registration
- [ ] All action types exported from action-types/index.ts
- [ ] All entity hooks exported from entity-hooks/index.ts
- [ ] index.ts registerClass() includes all modules

## Validation
- [ ] yarn workspace stack9-stack validate passes
```

---

## Instructions for the AI

1. **At migration start**: Read `migration-checklist.md` from the project root if it exists. If not, create it from the template above, filling in source, target, and date.

2. **During migration**: After completing each section, update the checklist by ticking the relevant checkbox (`- [ ]` → `- [x]`).

3. **When resuming**: Read `migration-checklist.md` first to understand what's already done. Skip completed sections and continue from the first unchecked item.

4. **At migration end**: Ensure all boxes are ticked and `yarn workspace stack9-stack validate` passes.
