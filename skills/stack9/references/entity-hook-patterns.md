# Stack9 Entity Hook Patterns

## File location

`packages/stack9-stack/src/entity-hooks/{entity_key}.vat.ts`

## When to use entity hooks

- Pre-save validation beyond simple field rules
- Cross-entity validation (checking related records)
- Computed field values on create or update
- Guarding workflow transitions
- Post-create side effects

## Hook structure

```typescript
import { CustomFunction, CustomFunctionResponse, HookOperation } from '@april9au/stack9-sdk';

export class ValidateSupportTicket extends CustomFunction {
  entityName = 'support_ticket';

  async exec(): Promise<CustomFunctionResponse> {
    const { entity, operation, oldEntity, db } = this.context;

    if (operation === HookOperation.delete) {
      const tasks = await db('task')
        .where({ entity_id: entity.id, _is_deleted: false })
        .count('id as count')
        .first();
      if (tasks && Number(tasks.count) > 0) {
        return { valid: false, message: 'Cannot delete a ticket with open tasks' };
      }
    }

    if (operation === HookOperation.create || operation === HookOperation.update) {
      if (entity.priority === 'Critical' && !entity.assigned_to_id) {
        return { valid: false, message: 'Critical tickets must be assigned' };
      }
    }

    return { valid: true, entity };
  }
}
```

## HookOperation values

| Value | When |
|---|---|
| `HookOperation.create` | Before record is created |
| `HookOperation.update` | Before record is updated |
| `HookOperation.delete` | Before record is deleted |

## Context properties

| Property | Description |
|---|---|
| `entity` | The record being saved (new values) |
| `oldEntity` | Previous values (available on update) |
| `operation` | The current `HookOperation` |
| `db` | Knex database instance for querying related data |
