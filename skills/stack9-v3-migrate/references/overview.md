# Stack9 v3 → v5: Project Structure Overview

## Package Name Change

| v3 | v5 |
|---|---|
| `@april9/stack9-sdk` | `@april9au/stack9-sdk` |

Update all imports in TypeScript files.

## Directory Mapping

| v3 Path | v5 Path |
|---|---|
| `stack9/stack9.json` | `packages/stack9-stack/stack9.config.json` |
| `stack9/server/app.json` | `packages/stack9-stack/src/app.json` (simplified) + `src/apps/*.json` |
| `stack9/server/entities/custom/*.json` | `packages/stack9-stack/src/entities/custom/*.json` |
| `stack9/server/entities/native/*.json` | `packages/stack9-stack/src/entities/native/*.json` |
| `stack9/server/workflow-functions/custom/{entity}/*.ts` | `packages/stack9-stack/src/entity-hooks/{entity}.vat.ts` |
| `stack9/server/api-functions/*.ts` | `packages/stack9-stack/src/action-types/{ActionType}.ts` |
| `stack9/server/cron-jobs/*.ts` | `packages/stack9-stack/src/action-types/{CronAction}.ts` + `apps/app-aws-cloud/src/lib/event-schedulers.ts` |
| `stack9/server/database/migrations/` | `packages/stack9-stack/src/database/migrations/` |
| `stack9/server/models/stack9/` | `packages/stack9-stack/src/models/stack9/` (generated) |
| *(not in v3)* | `packages/stack9-stack/src/query-library/*.json` |
| *(not in v3)* | `packages/stack9-stack/src/screens/*.json` |
| *(not in v3)* | `packages/stack9-stack/src/automations/*.json` |
| *(not in v3)* | `packages/stack9-stack/src/connectors/*.json` |

## v5 Source Structure (canonical)

```
packages/stack9-stack/
├── stack9.config.json
└── src/
    ├── index.ts               ← registerClass entry point
    ├── app.json               ← simplified app config
    ├── apps/
    │   └── {app}.json         ← one file per app with navigation
    ├── entities/
    │   ├── entity-folders.json
    │   ├── custom/
    │   │   └── {entity}.json
    │   └── native/
    │       └── user.json
    ├── entity-hooks/
    │   ├── index.ts
    │   └── {entity}.vat.ts
    ├── action-types/
    │   ├── index.ts
    │   └── {ActionType}.ts
    ├── automations/
    │   ├── after_{entity}_{event}.json
    │   └── webhook_{name}.json
    ├── query-library/
    │   └── {query_name}.json
    ├── screens/
    │   └── {screen_name}.json
    ├── connectors/
    │   └── {connector}.json
    ├── models/
    │   └── stack9/             ← auto-generated, do not edit
    ├── database/
    │   └── migrations/
    ├── services/               ← shared TypeScript utilities
    └── events/
```

## Models (auto-generated)

Models in `src/models/stack9/` are auto-generated from entity JSON — **never edit them by hand**.

Generate with:
```bash
yarn workspace stack9-stack generate-models
```

This runs `yo @april9au/stack9-generator:entities` for both custom and native entities.

**Schema library**: newer versions of `@april9au/stack9-generator` produce **zod** schemas. Older versions produced **runtypes** schemas. Check the existing model files after generation to know which is in use — do not assume one or the other.

- **runtypes**: `import * as rt from 'runtypes'` — `rt.Record({...})`, `rt.Static<typeof X>`
- **zod**: `import { z } from 'zod'` — `z.object({...})`, `z.infer<typeof X>`

When writing action types or entity hooks that import generated models, match the schema library the generated models use.

## v5 index.ts Registration

All action types, entity hooks, and events must be registered:

```typescript
import { registerClass } from '@april9au/stack9-sdk';
import * as actionTypes from './action-types';
import * as entityHooks from './entity-hooks';
import * as events from './events';

export default registerClass({
  ...events,
  ...actionTypes,
  ...entityHooks,
});
```

## v5 stack9.config.json

```json
{
  "ProjectName": "project-name",
  "Stack9CoreVersion": "5.x.x",
  "DatabaseEngine": "pg",
  "DatabaseEngineOptions": ["pg"],
  "CloudPlatform": "aws",
  "CloudPlatformOptions": ["aws"],
  "UseKafka": false,
  "Organisation": "ORG_CODE",
  "Modules": ["@april9au/stack9-core-module"]
}
```

## v5 app.json (simplified)

```json
{
  "name": "App Display Name",
  "dateFormat": "DD-MM-YYYY",
  "timeFormat": "h:mm a",
  "timezone": "Australia/Sydney",
  "favicon": "https://...",
  "instanceIcon": "https://...",
  "brandColor": "#hex",
  "theme": "dark",
  "logo": "https://...",
  "apps": [],
  "mqHandlers": [],
  "allowedAccountsForNonProdEmailSending": []
}
```

Note: `apps[]` is now empty — navigation lives in `src/apps/*.json`. There is no `cronJobs[]` in v5 app.json — scheduled jobs use AWS EventBridge Schedulers defined in `apps/app-aws-cloud/src/lib/event-schedulers.ts`.
