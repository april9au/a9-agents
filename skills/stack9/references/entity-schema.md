# Stack9 Entity Schema

## Entity file location

`packages/stack9-stack/src/entities/custom/{entity_key}.json`

## Basic structure

```json
{
  "head": {
    "name": "Support Ticket",
    "key": "support_ticket",
    "pluralisedName": "support_tickets",
    "isActive": true,
    "allowComments": true,
    "allowTasks": true,
    "allowAttachments": true
  },
  "fields": []
}
```

## Field types

```json
{ "label": "Name", "key": "name", "type": "TextField", "validateRules": { "required": true, "maxLength": 300 } }
{ "label": "Amount", "key": "amount", "type": "NumericField", "typeOptions": { "decimals": 2, "allowNegative": false } }
{ "label": "Due Date", "key": "due_date", "type": "DateField" }
{ "label": "Notes", "key": "notes", "type": "MultiLineTextField" }
{ "label": "Is Active", "key": "is_active", "type": "CheckBoxField", "defaultValue": true }
{ "label": "Status", "key": "status", "type": "OptionSet", "typeOptions": { "values": ["Draft", "Active", "Closed"] }, "defaultValue": "Draft" }
{
  "label": "Customer",
  "key": "customer_id",
  "type": "SingleDropDown",
  "relationshipOptions": { "ref": "customer" },
  "typeOptions": { "label": "{{name}} ({{email}})" },
  "validateRules": { "required": true }
}
{
  "label": "Order Items",
  "key": "order_items",
  "type": "Grid",
  "relationshipOptions": { "ref": "order_item" },
  "typeOptions": { "relationshipField": "order_id" }
}
{ "label": "Total", "key": "total", "type": "NumericField", "typeOptions": { "decimals": 2 }, "behaviourOptions": { "readOnly": true }, "defaultValue": 0 }
```

## Key field properties

| Property | Purpose |
|---|---|
| `validateRules` | `{ required, min, max, maxLength, minLength }` |
| `behaviourOptions` | `{ readOnly: true }` for computed or system fields |
| `typeOptions` | Type-specific config — `decimals`, `values`, `label` template, `relationshipField` |
| `relationshipOptions` | `{ ref: "entity_key" }` for relationship fields |
| `index: true` | Add to fields used in WHERE clauses or ORDER BY |
| `defaultValue` | Initial value on record creation |

## Naming conventions

- Entity `key` and field `key` → `snake_case` (e.g. `support_ticket`, `assigned_to_id`)
- Always set `index: true` on fields used in WHERE or ORDER BY
- Use `_is_deleted: false` in queries — all Stack9 entities support soft delete
