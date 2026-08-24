# Stack9 v3 → v5: Cron Jobs Migration

## What Changes

v3 used **cron-jobs** — class-based TypeScript files triggered via `app.json.cronJobs`.  
v5 uses **AWS CDK EventBridge Schedulers** — defined in `apps/app-aws-cloud/src/lib/event-schedulers.ts`, which trigger action types via SQS queues. There is no `cronJobs` key in v5 app.json and no automation JSON for scheduled jobs.

## Source → Target Mapping

```
v3: stack9/server/cron-jobs/{job-name}.ts
    └─ implements CronJobFunction

    stack9/server/app.json → cronJobs: [{ "command": "job-name", "cronTime": "*/5 * * * *" }]

v5: packages/stack9-stack/src/action-types/{CronJobName}.ts
    └─ implements S9AutomationActionType
    └─ description.key must match messageBody.queue in the scheduler

    apps/app-aws-cloud/src/lib/event-schedulers.ts
    └─ TEventSchedulers array entry for each cron job
```

## v3 Pattern

```typescript
import {
  CronJobContext,
  CronJobFunction,
  CronJobResponse,
  withCronJob,
} from '@april9/stack9-sdk';

class MyScheduledJob extends CronJobFunction {
  constructor(private context: CronJobContext) {
    super();
  }

  async exec(): Promise<CronJobResponse> {
    const { services, logger } = this.context;

    try {
      const records = await this.context.db.trx
        .select('id')
        .from('my_entity')
        .where({ _is_deleted: false });

      for (const record of records) {
        await services.entity.update('my_entity', record.id, { processed: true });
      }

      return { success: true, message: `Processed ${records.length} records` };
    } catch (err) {
      logger.error(err);
      return { success: false, message: String(err) };
    }
  }
}

export default withCronJob(MyScheduledJob, 5000);
```

## v5 Action Type (stack9-stack side)

```typescript
import {
  S9AutomationActionType,
  S9AutomationActionTypeDescription,
  S9AutomationContext,
  S9InputTypes,
} from '@april9au/stack9-sdk';
import * as rt from 'runtypes';

const Input = rt.Record({
  retentionDays: rt.Number,
});

export class MyScheduledJob implements S9AutomationActionType {
  description: S9AutomationActionTypeDescription = {
    name: 'My Scheduled Job',
    key: 'my_scheduled_job',
    description: 'Processes records on a schedule',
    icon: 'RunScriptIcon',
    properties: [
      {
        name: 'retentionDays',
        label: 'Retention Days',
        type: S9InputTypes.InputNumber,
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
      logger.info('START: my scheduled job...');
      const { retentionDays } = Input.check(params);

      const records = await services.entity.findAll('my_entity', rt.Record({ id: rt.Number }), {
        $where: { _is_deleted: false },
        $select: ['id'],
      });

      for (const record of records) {
        await services.entity.update('my_entity', record.id, { processed: true });
      }

      logger.info('END: my scheduled job - success');
      return next();
    } catch (err) {
      logger.error(err, 'Scheduled job failed');
      throw err;
    }
  };
}
```

## v5 EventBridge Scheduler (CDK side)

Add an entry to `apps/app-aws-cloud/src/lib/event-schedulers.ts`:

```typescript
import { TEventSchedulers } from '@april9au/aws-infrastructure';

export const EVENT_SCHEDULERS: TEventSchedulers = [
  {
    key: 'my_scheduled_job',
    description: 'Human-readable description of what this job does',
    queuePriority: 'standard',
    scheduleExpression: 'cron(0 16 1 * ? *)',
    scheduleExpressionTimezone: 'UTC',
    messageBody: {
      queue: 'my_scheduled_job',
      entityType: 'my_entity',
      body: JSON.stringify({ retentionDays: 30 }),
    },
  },
];
```

### Key fields

| Field | Description |
|---|---|
| `key` | Unique identifier for this scheduler |
| `queuePriority` | `'standard'` \| `'realtime'` \| `'long'` — match to job duration |
| `scheduleExpression` | AWS cron syntax: `cron(min hour day month weekday year)` — use `?` for "any" in day or weekday |
| `scheduleExpressionTimezone` | Usually `'UTC'` |
| `messageBody.queue` | **Must match** the action type's `description.key` exactly |
| `messageBody.entityType` | The entity key this job primarily operates on |
| `messageBody.body` | JSON string of params passed to the action type's `execute()` via `params` |

### AWS cron syntax examples

| v3 cronTime | AWS cron equivalent |
|---|---|
| `*/5 * * * *` | `cron(*/5 * * * ? *)` |
| `0 0 * * *` | `cron(0 0 * * ? *)` |
| `0 16 1 * *` | `cron(0 16 1 * ? *)` |
| `5 0 * * *` | `cron(5 0 * * ? *)` |

## Key Differences

| Aspect | v3 | v5 |
|---|---|---|
| Package | `@april9/stack9-sdk` | `@april9au/stack9-sdk` |
| Base class | `extends CronJobFunction` | `implements S9AutomationActionType` |
| Context | `CronJobContext` | `S9AutomationContext` |
| Schedule config | `app.json cronJobs[].cronTime` | AWS CDK `event-schedulers.ts` — EventBridge Scheduler |
| Raw DB access | `this.context.db.trx` | `services.entity.findAll()` with runtype schema |
| Return | `return { success, message }` | `return next()` |
| Params from schedule | Hardcoded in class | Passed via `messageBody.body` JSON → `params` |

## Wiring into the CDK entry point

After creating `event-schedulers.ts`, import it in `apps/app-aws-cloud/src/bin/app-aws-cloud.ts` and pass it to `DeployedDataStack`. The file typically has a `[]` placeholder comment:

```typescript
// Before
import { WEBSERVER } from '../lib/environment-constants/webserver';

// ...
const dataStack = new DeployedDataStack(
  app, cdkStackNameData, environmentType, deploymentCluster,
  [], //appSchedulersConfig
  stackProps,
);

// After
import { WEBSERVER } from '../lib/environment-constants/webserver';
import { EVENT_SCHEDULERS } from '../lib/event-schedulers';

// ...
const dataStack = new DeployedDataStack(
  app, cdkStackNameData, environmentType, deploymentCluster,
  EVENT_SCHEDULERS,
  stackProps,
);
```

If `event-schedulers.ts` does not exist yet, create it — do not leave the `[]` placeholder.

## No automation JSON needed

Unlike webhook-triggered action types, scheduled jobs do **not** need an automation JSON file. The EventBridge scheduler sends directly to the SQS queue. The action type key is the queue routing key.

## v3 Database Access → v5

v3 allowed direct Knex via `this.context.db.trx`. In v5 prefer the entity service:

```typescript
// v3
const records = await this.context.db.trx
  .select('id', 'name')
  .from('my_entity')
  .where({ _is_deleted: false });

// v5
const RecordSchema = rt.Record({ id: rt.Number, name: rt.String });
const records = await services.entity.findAll('my_entity', RecordSchema, {
  $where: { _is_deleted: false },
  $select: ['id', 'name'],
});
```

If complex SQL is unavoidable (cross-entity joins, aggregations), use `db.knex.raw()` directly.
