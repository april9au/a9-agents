# Stack9 Automation Schema

## File location

`packages/stack9-stack/src/automations/{key}.json`

## Naming convention

- `key` → `snake_case` with descriptive verb (e.g. `after_support_ticket_create`)

## Basic automation

```json
{
  "key": "after_support_ticket_create",
  "name": "After Support Ticket Created",
  "entityKey": "support_ticket",
  "app": "my_app",
  "triggerType": "afterCreate",
  "triggerParams": {},
  "actions": [
    {
      "name": "Send notification email",
      "key": "send_email",
      "actionTypeKey": "send_email",
      "params": {
        "to": "{{entity.reporter_email}}",
        "subject": "Ticket #{{entity.id}} received",
        "body": "Your ticket '{{entity.title}}' has been received."
      }
    }
  ]
}
```

## Conditional actions

```json
{
  "conditionalActions": [
    {
      "condition": {
        "rules": [
          { "field": "{{entity.priority}}", "value": "Critical", "operator": "equals" }
        ],
        "combinator": "and"
      },
      "actions": [
        {
          "name": "Alert on-call",
          "key": "alert_oncall",
          "actionTypeKey": "send_slack_message",
          "params": { "message": "Critical ticket created: {{entity.title}}" }
        }
      ]
    }
  ]
}
```

## triggerType values

| Value | When it fires |
|---|---|
| `afterCreate` | After a record is created |
| `afterUpdate` | After a record is updated |
| `afterDelete` | After a record is deleted |
| `afterWorkflowMove` | After a workflow status transition |
