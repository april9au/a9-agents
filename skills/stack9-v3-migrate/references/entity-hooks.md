# Stack9 v3 → v5: Entity Hooks Migration

## What Changes

v3 used **workflow-functions** — class-based TypeScript files per entity, per hook type, declared in entity JSON `hooks[]`.  
v5 uses **entity-hooks** — one `.vat.ts` file per entity. The hook self-associates with its entity via the `entityName` property and the file naming convention `{entity}.vat.ts`. **No entry in entity JSON is needed — remove `hooks[]` from entity JSON entirely.**

## Source → Target Mapping

```
v3: stack9/server/workflow-functions/custom/{entity}/validateAndTransform.ts
    stack9/server/workflow-functions/custom/{entity}/afterSave.ts
    stack9/server/workflow-functions/custom/shared/{shared}.ts

v5: packages/stack9-stack/src/entity-hooks/{entity}.vat.ts
    packages/stack9-stack/src/entity-hooks/index.ts
```

Multiple v3 hook files for the same entity merge into one v5 `.vat.ts` file. Use `operation` to differentiate.

## v3 Pattern

```typescript
import {
  CustomFunction,
  CustomFunctionContext,
  CustomFunctionResponse,
  withCustomFunction,
} from '@april9/stack9-sdk';

import { Banner } from '../../../models/stack9/Banner';

class ValidateAndTransform extends CustomFunction {
  constructor(private context: CustomFunctionContext<Banner>) {
    super();
  }

  public async exec(): Promise<CustomFunctionResponse> {
    const { entity } = this.context;

    if (!entity.is_not_sensitive) {
      return {
        entity,
        valid: false,
        errorMessage: 'Checkbox is required',
      };
    }

    return { entity, valid: true, errorMessage: undefined };
  }
}

export default withCustomFunction(ValidateAndTransform, 5000);
```

## v5 Pattern

```typescript
import {
  CustomFunction,
  CustomFunctionContext,
  CustomFunctionResponse,
  HookOperation,
} from '@april9au/stack9-sdk';

import { DBBanner } from '../models/stack9/Banner';

export class ValidateBanner extends CustomFunction {
  constructor(
    private context: CustomFunctionContext<DBBanner>,
  ) {
    super();
  }

  entityName = 'banner';

  async exec(): Promise<CustomFunctionResponse> {
    const { entity, operation, oldEntity, services, logger } = this.context;

    if (!entity.is_not_sensitive) {
      return {
        entity,
        valid: false,
        errorMessage: 'Checkbox is required',
      };
    }

    return { entity, valid: true };
  }
}
```

## Critical: Always Use DB Model Types

`CustomFunctionContext<T>` constrains `T` to include `id`, `_is_deleted`, `_created_at`, `_created_by`, `_updated_at`, `_updated_by`. Plain generated models (e.g. `Banner`) do not include these — they fail the constraint at compile time.

**Always import and use the `DB*` variant:**

```typescript
// WRONG — causes TS2344 lint error
import { Banner } from '../models/stack9/Banner';
constructor(private context: CustomFunctionContext<Banner>)

// CORRECT
import { DBBanner } from '../models/stack9/Banner';
constructor(private context: CustomFunctionContext<DBBanner>)
```

Generated models always export both: `Banner` (plain fields) and `DBBanner = ZEntityInterface.merge(Banner)` (includes id + audit fields). Entities with workflow also have a third variant, e.g. `DBFormSubmission = ZEntityWorkflowInterface.merge(ZEntityInterface.merge(FormSubmission))`.

Use `DB*` in hooks, use plain type only when you specifically need to exclude audit fields (e.g. `insert()` calls).

## Critical: Null-Check find() Results

`services.entity.find<T>()` returns `T | null`. Always guard before destructuring:

```typescript
const result = await services.entity.find<DBSubmitStatus>('submit_status', { $where: { id } });
if (!result) return { entity, valid: true };
const { status } = result;
```

## Critical: findAll Does Not Accept $select

`findAll` signature is `findAll<T>(entityName, validator: Runtype<T>, criterion: Omit<S9Query, '$select'>)`. The `$select` property is intentionally omitted — field selection is handled by the runtype validator passed as the second argument. Passing `$select` causes a TS2353 compile error.

## Key Differences

| Aspect | v3 | v5 |
|---|---|---|
| Package | `@april9/stack9-sdk` | `@april9au/stack9-sdk` |
| Export style | `export default withCustomFunction(Class, timeout)` | `export class ValidateX extends CustomFunction` |
| Association | Referenced in entity JSON `hooks[]` | `entityName = 'entity_key'` property |
| Class name | Any (`ValidateAndTransform`) | Descriptive (`Validate{Entity}`) |
| Context access | `this.context.*` | `this.context.*` (same) |
| Operation check | Not available | `operation` from `HookOperation` enum |

## Using HookOperation

When merging multiple v3 hook types into one v5 file, use `HookOperation`:

```typescript
import { HookOperation } from '@april9au/stack9-sdk';

async exec(): Promise<CustomFunctionResponse> {
  const { entity, operation, oldEntity } = this.context;

  if (operation === HookOperation.create) {
    // logic from v3 validateAndTransform for create
  }

  if (operation === HookOperation.update) {
    // logic from v3 afterSave for update
  }

  return { entity, valid: true };
}
```

Available operations: `HookOperation.create`, `HookOperation.update`, `HookOperation.delete`

## Context Properties

```typescript
const {
  entity,      // incoming entity data (what's being saved)
  oldEntity,   // entity state before this operation (undefined on create)
  operation,   // HookOperation enum
  services,    // { entity, workflow, storage, queryLibrary, ... }
  logger,      // pino logger
} = this.context;
```

## Updating index.ts

After creating each `.vat.ts` file, export it from `entity-hooks/index.ts`:

```typescript
export * from './banner.vat';
export * from './customer.vat';
export * from './form_submission.vat';
```

## Shared Logic

If v3 had shared functions under `workflow-functions/custom/shared/`, move that logic to:
- `packages/stack9-stack/src/services/{serviceName}.ts` (shared service)
- Or inline into the individual `.vat.ts` files if small

## Returning from exec()

```typescript
// Valid — allow the operation
return { entity, valid: true };

// Invalid — block the operation with a message
return { entity, valid: false, errorMessage: 'Validation failed' };

// Modify entity before save
return { entity: { ...entity, computed_field: value }, valid: true };
```
