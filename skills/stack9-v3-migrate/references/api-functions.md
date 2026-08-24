# Stack9 v3 → v5: API Functions → Action Types + Webhook Automations

## What Changes

v3 used **api-functions** — class-based custom REST endpoints exposed directly.  
v5 replaces these with **action types** (TypeScript) + **webhook automation JSON** (config).

## Source → Target Mapping

```
v3: stack9/server/api-functions/{function-name}.ts
    └─ defines HTTP method + path + logic

v5: packages/stack9-stack/src/action-types/{ActionTypeName}.ts
    └─ implements S9AutomationActionType with business logic

    packages/stack9-stack/src/automations/webhook_{name}.json
    └─ connects the HTTP endpoint to the action type
```

## v3 Pattern

```typescript
import {
  CustomApi,
  CustomApiContext,
  CustomApiResponse,
  withApi,
} from '@april9/stack9-sdk';
import Joi from 'joi';

type RequestBody = {
  entity_id: number;
  data: string;
};

class MyApiFunction extends CustomApi {
  constructor(private ctx: CustomApiContext<any, RequestBody>) {
    super();
  }

  async exec(): Promise<CustomApiResponse> {
    const { body, logger, services } = this.ctx;

    try {
      const { entity_id, data } = body;

      const result = await services.entity.find('my_entity', {
        $where: { id: entity_id, _is_deleted: false },
      });

      if (!result) {
        return this.badRequest({ error: 'Not found' });
      }

      return this.ok({ success: true, result }, 200);
    } catch (error) {
      logger.error(error);
      return this.badRequest({ error: error?.message });
    }
  }
}

export default withApi(MyApiFunction, 2000);
```

## v5 Action Type Pattern

```typescript
import {
  S9AutomationActionType,
  S9AutomationActionTypeDescription,
  S9AutomationContext,
  S9InputTypes,
} from '@april9au/stack9-sdk';
import { z } from 'zod';

const Params = z.object({
  entity_id: z.number(),
  data: z.string(),
});

export class MyFunction implements S9AutomationActionType {
  description: S9AutomationActionTypeDescription = {
    name: 'My Function',
    key: 'my_function',
    description: 'Description of what this does',
    icon: 'CheckCircleOutlined',
    properties: [
      {
        name: 'entity_id',
        label: 'Entity ID',
        type: S9InputTypes.ValueCodeMirror,
        rules: [{ required: true }],
      },
    ],
  };

  execute = async ({
    params,
    services,
    logger,
    next,
  }: S9AutomationContext): Promise<void> => {
    try {
      const { entity_id, data } = Params.parse(params);

      const result = await services.entity.find('my_entity', {
        $where: { id: entity_id, _is_deleted: false },
      });

      if (!result) {
        return next({ success: false, message: 'Entity not found', response_code: 404 });
      }

      return next({ success: true, result });
    } catch (err) {
      logger.error(err, 'Error in MyFunction');
      return next({ success: false, message: String(err), response_code: 400 });
    }
  };
}
```

## v5 Webhook Automation JSON

```json
{
  "key": "webhook_my_function",
  "name": "My Function",
  "entityKey": "my_entity",
  "app": "app_key",
  "triggerType": "webhook",
  "triggerParams": {
    "method": "post",
    "path": "/my-endpoint"
  },
  "actions": [
    {
      "name": "Execute my function",
      "key": "execute_my_function",
      "actionTypeKey": "my_function",
      "params": {
        "entity_id": "{{trigger.body.entity_id}}",
        "data": "{{trigger.body.data}}"
      }
    }
  ]
}
```

## Key Differences

| Aspect | v3 | v5 |
|---|---|---|
| Package | `@april9/stack9-sdk` | `@april9au/stack9-sdk` |
| Base class | `extends CustomApi` | `implements S9AutomationActionType` |
| Context | `CustomApiContext<any, Body>` | `S9AutomationContext` |
| Completion | `return this.ok(data, 200)` / `return this.badRequest(...)` | `return next({ success: true, result })` |
| Export | `export default withApi(Class, timeout)` | `export class MyFunction implements S9AutomationActionType` |
| HTTP config | Inside the class constructor | In `webhook_*.json` automation |
| Params | `ctx.body` | `params` (typed via zod or z.object) |

## Trigger Params (HTTP Methods)

```json
"triggerParams": {
  "method": "get",
  "path": "/resource"
}
```
```json
"triggerParams": {
  "method": "post",
  "path": "/resource"
}
```
```json
"triggerParams": {
  "method": "put",
  "path": "/resource/:id"
}
```
```json
"triggerParams": {
  "method": "delete",
  "path": "/resource/:id"
}
```

## Accessing v3 ctx Properties in v5

| v3 `ctx.*` | v5 `S9AutomationContext.*` |
|---|---|
| `ctx.body` | `params` (passed from automation JSON via `{{trigger.body.*}}`) |
| `ctx.logger` | `logger` |
| `ctx.services.entity` | `services.entity` |
| `ctx.services.storage` | `services.storage` |
| `ctx.services.workflow` | `services.workflow` |
| `ctx.services.queryLibrary` | `services.queryLibrary` |

## Updating action-types/index.ts

```typescript
export * from './MyFunction';
export * from './AnotherFunction';
```

## FileUploadRequest Requires size

`services.storage.upload()` takes a `FileUploadRequest` which requires `size: number`. When building a buffer from base64 or a string, compute it explicitly:

```typescript
const buffer = Buffer.from(image.base64EncodedImage, 'base64');
await services.storage.upload(path, {
  buffer,
  originalname: image.name,
  mimetype: image.mimetype,
  encoding: 'base64',
  size: Buffer.byteLength(image.base64EncodedImage, 'base64'),
}, true);
```

For strings (e.g. EML content):
```typescript
size: Buffer.byteLength(content, 'utf-8')
```

## Untyped npm Packages

If a package has no `@types/*` equivalent, create a declaration file in `packages/stack9-stack/types/{package-name}.d.ts`. The `tsconfig.json` already includes `"types/*"` in its `include` array.

Example for `eml-format`:
```typescript
declare module 'eml-format' {
  function build(data: EmailData, callback: (error: Error | null, eml: string) => void): void;
}
```

## renderDocDetails Was Removed in v5

The v3 method `services.entity.renderDocDetails(entityKey, entityId, printableDocumentId)` does not exist in v5. It was removed along with the native `PrintableDocument` entity (commit S9-1295).

The v5 replacement is `services.printableDocument.renderPrintableDocument(templateKey, options)`, which reads templates from the **file system** (`src/template/`) rather than the database. Migration requires:
1. Creating a template file at `src/template/{key}.json`
2. Creating a matching query library entry for data fetching
3. Calling `services.printableDocument.renderPrintableDocument(code, { vars: { id: String(entityId) } })`

If the template does not exist yet, leave a `// TODO` comment and continue — do not guess at the template key.

## Available Ant Design Icons for `description.icon`

Use Ant Design icon names: `CheckCircleOutlined`, `UploadOutlined`, `SyncOutlined`, `MailOutlined`, `DatabaseOutlined`, etc.
