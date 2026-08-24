# Stack9 v3 → v5: Automations

## What's New in v5

v3 had no automation JSON files. All side effects were inside entity hooks or cron jobs.  
v5 introduces **automation JSON** — declarative configs that wire entity lifecycle events to action types.

## Automation JSON Structure

```json
{
  "key": "automation_key",
  "name": "Human Readable Name",
  "entityKey": "entity_name",
  "app": "app_key",
  "triggerType": "afterCreate | afterUpdate | afterDelete | afterWorkflowMove | webhook",
  "triggerParams": {},
  "actions": [
    {
      "name": "Action description",
      "key": "unique_action_key",
      "actionTypeKey": "action_type_key",
      "params": {
        "paramName": "{{trigger.entity.field}}"
      }
    }
  ],
  "conditionalActions": []
}
```

## Trigger Types

### afterCreate
Fires after a new entity record is saved.
```json
{
  "triggerType": "afterCreate",
  "triggerParams": {}
}
```
Params template: `{{trigger.entity.*}}` (the created entity)

### afterUpdate
Fires after an entity record is updated.
```json
{
  "triggerType": "afterUpdate",
  "triggerParams": {}
}
```
Params template: `{{trigger.entity.*}}` (updated entity), `{{trigger.oldEntity.*}}` (previous state)

### afterDelete
Fires after an entity record is soft-deleted.
```json
{
  "triggerType": "afterDelete",
  "triggerParams": {}
}
```

### afterWorkflowMove
Fires when a workflow action is taken on an entity.
```json
{
  "triggerType": "afterWorkflowMove",
  "triggerParams": {}
}
```
Params template: `{{trigger.entityId}}`, `{{trigger.actionKey}}`

### webhook
Fires when an HTTP request hits a configured endpoint.
```json
{
  "triggerType": "webhook",
  "triggerParams": {
    "method": "post",
    "path": "/endpoint-path"
  }
}
```
Params template: `{{trigger.body.*}}`, `{{trigger.query.*}}`, `{{trigger.params.*}}`

## Naming Conventions

| Trigger | Filename convention |
|---|---|
| afterCreate | `after_{entity}_create.json` |
| afterUpdate | `after_{entity}_update.json` |
| afterDelete | `after_{entity}_delete.json` |
| afterWorkflowMove | `after_{entity}_workflow_move.json` |
| webhook | `webhook_{descriptive_name}.json` |

## Params Templating

Use Handlebars-style `{{}}` to pass data from the trigger to the action type params:

```json
"params": {
  "entityId": "{{trigger.entity.id}}",
  "actionKey": "{{trigger.actionKey}}",
  "parentId": "{{trigger.entity.parent_id}}"
}
```

For webhook triggers:
```json
"params": {
  "body_field": "{{trigger.body.field_name}}",
  "query_param": "{{trigger.query.param_name}}"
}
```

For inline objects (use triple braces):
```json
"params": {
  "message": "{{{instanceId: trigger.entity.some_id}}}"
}
```

## When to Create Automations

Create an automation JSON when migrating:
- **v3 api-function** → `webhook_*.json` automation
- **v3 entity afterSave hook** that triggered side effects → `after_{entity}_{event}.json`
- **v3 cron job** that runs on a schedule → configure in `app.json.cronJobs`

Side effects that only validate/transform the entity (pure VAT logic) stay in entity hooks — no automation needed.

## Examples

### After create — queue a job
```json
{
  "key": "after_submission_create",
  "name": "After Submission Created - Queue Processing",
  "entityKey": "form_submission",
  "app": "fnol",
  "triggerType": "afterCreate",
  "triggerParams": {},
  "actions": [
    {
      "name": "Queue processing",
      "key": "queue_processing",
      "actionTypeKey": "add_message_queue",
      "params": {
        "queueName": "submission_processing_queue",
        "priority": "realtime",
        "message": "{{{submissionId: trigger.entity.id}}}"
      }
    }
  ],
  "conditionalActions": []
}
```

### Webhook — call custom logic
```json
{
  "key": "webhook_insert_user_images",
  "name": "Insert User Images",
  "entityKey": "user",
  "app": "admin",
  "triggerType": "webhook",
  "triggerParams": {
    "method": "post",
    "path": "/user/images"
  },
  "actions": [
    {
      "name": "Insert images",
      "key": "insert_images",
      "actionTypeKey": "insert_user_images",
      "params": {
        "user_id": "{{trigger.body.user_id}}",
        "sequence": "{{trigger.body.sequence}}",
        "image": "{{trigger.body.image}}"
      }
    }
  ]
}
```

### After workflow move
```json
{
  "key": "after_submission_workflow_move",
  "name": "After Submission Workflow Move - Process EML",
  "entityKey": "form_submission",
  "app": "fnol",
  "triggerType": "afterWorkflowMove",
  "triggerParams": {},
  "actions": [
    {
      "name": "Process EML creation",
      "key": "process_eml",
      "actionTypeKey": "create_eml_object",
      "params": {
        "submissionId": "{{trigger.entityId}}",
        "actionKey": "{{trigger.actionKey}}"
      }
    }
  ],
  "conditionalActions": []
}
```
