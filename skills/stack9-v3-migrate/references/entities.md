# Stack9 v3 → v5: Entity Migration

## What Changes

- The entity JSON schema is largely compatible between v3 and v5
- `hooks[]` array in the entity JSON: **remove the v3 hook references** — in v5, entity hooks self-associate via the `entityName` property in `.vat.ts` files
- New v5 field properties: `index`, `behaviourOptions`, `description`
- Grid fields: remove `gridSettings` from individual field definitions if it was there (stays at entity root)

## What Must Be Fixed (v3 → v5 Breaking Changes)

These are not optional — the validator will reject entities that still have them.

### 1. Remove `relationshipOptions.many` entirely

v3 allowed `many: false` on `SingleDropDown` fields as a no-op. v5 does not allow the `many` key at all on any field type — including `MultiDropDown`. Strip it unconditionally:

```json
// v3 — remove this regardless of value
"relationshipOptions": { "ref": "entity_key", "many": false }

// v5 — key does not exist
"relationshipOptions": { "ref": "entity_key" }
```

> Note: `MultiDropDown` self-describes the many relationship via its type. No `many` flag is needed.

### 2. `HTMLField` → `RichTextEditor`

`HTMLField` does not exist in v5. Replace with `RichTextEditor`:

```json
// v3
{ "key": "instructions", "type": "HTMLField" }

// v5
{ "key": "instructions", "type": "RichTextEditor" }
```

### 3. `typeOptions.accept` must be an array

v3 accepted a comma-separated string. v5 requires an array:

```json
// v3
"typeOptions": { "accept": "image/jpeg, image/png" }

// v5
"typeOptions": { "accept": ["image/jpeg", "image/png"] }
```

### 4. Remove `typeOptions.allowCreate` and `typeOptions.gridSettings`

These v3-only options are not valid in v5 and will fail validation. Remove them from any field's `typeOptions`:

```json
// v3 — remove both of these
"typeOptions": { "allowCreate": true, "gridSettings": { ... } }
```

### 5. `workflowDefinition.actions[].from` must be an object

v3 used an array. v5 requires `{ "step": [...] }`. The special string `"ALL"` must be expanded to the full list of step keys:

```json
// v3
"from": ["progress"]
"from": ["ALL"]

// v5
"from": { "step": ["progress"] }
"from": { "step": ["progress", "queued"] }   // list all steps explicitly
```

---

## What Stays the Same

- `head` section (key, name, pluralisedName, isActive, allowComments, allowTasks)
- `fields[]` array and all field types (TextField, NumericField, DateField, Checkbox, SingleDropDown, MultiDropDown, OptionSet, RichTextEditor, FileField, Grid)
- `formLayout.fieldsets[].rows[].columns[]`
- `gridSettings.agGrid.columnDefs[]`
- `workflowDefinition` (steps, actions, outcome)
- `printableDocuments`, `notifications`
- `relationshipOptions` (ref, many)
- `typeOptions` (label, value, precision, time, multiLine, accept, isPublic, relationshipField, allowCreate)
- `validateRules` (required, maxLength, min, max)

## Migration Steps

### 1. Copy entity file
```
FROM: stack9/server/entities/custom/{entity}.json
TO:   packages/stack9-stack/src/entities/custom/{entity}.json
```

### 2. Remove inline hooks
v3 entities had:
```json
"hooks": [
  {
    "type": "function",
    "hookType": "ValidateAndTransformInput",
    "functionName": "custom/shared/retireDateTimeValidation"
  }
]
```

In v5, set hooks to an empty array or remove it — entity hooks are registered via TypeScript:
```json
"hooks": []
```

### 3. Optionally add v5 field enhancements

Add `index: true` to frequently queried fields (foreign keys, status fields):
```json
{
  "key": "customer_id",
  "type": "SingleDropDown",
  "index": true,
  ...
}
```

Add `behaviourOptions` for computed/read-only fields:
```json
{
  "key": "total_amount",
  "behaviourOptions": {
    "readOnly": true
  },
  ...
}
```

Add `description` to clarify field purpose (optional but recommended):
```json
{
  "key": "reference_number",
  "description": "Unique reference for this record",
  ...
}
```

## Field Type Reference (unchanged)

| Type | Notes |
|---|---|
| `TextField` | `typeOptions.multiLine: true` for textarea |
| `NumericField` | `typeOptions.precision: 2` for decimals |
| `DateField` | `typeOptions.time: true` for datetime |
| `Checkbox` | Boolean field |
| `OptionSet` | `typeOptions.values: ["opt1", "opt2"]` |
| `SingleDropDown` | `relationshipOptions.ref: "entity_key"`, `typeOptions.label: "field_name"` |
| `MultiDropDown` | Same as SingleDropDown, add `relationshipOptions.many: true` |
| `RichTextEditor` | Rich text / HTML |
| `FileField` | `typeOptions.accept: "image/*"`, `typeOptions.isPublic: true/false` |
| `Grid` | `typeOptions.relationshipField: "parent_id"`, `relationshipOptions.ref: "child_entity"` |

## Example: Migrated Entity

```json
{
  "head": {
    "key": "claim_form",
    "name": "Claim Form",
    "pluralisedName": "Claim Forms",
    "isActive": true,
    "allowComments": false,
    "allowTasks": false
  },
  "fields": [
    {
      "key": "name",
      "label": "Name",
      "type": "TextField",
      "validateRules": { "required": true }
    },
    {
      "key": "customer_id",
      "label": "Customer",
      "type": "SingleDropDown",
      "relationshipOptions": { "ref": "customer" },
      "typeOptions": { "label": "name" },
      "validateRules": { "required": true },
      "index": true
    }
  ],
  "hooks": [],
  "formLayout": {
    "fieldsets": [
      {
        "key": "main",
        "isCollapsed": false,
        "rows": [
          {
            "columns": [
              { "fieldKey": "name" },
              { "fieldKey": "customer_id" }
            ]
          }
        ]
      }
    ]
  },
  "gridSettings": {
    "agGrid": {
      "columnDefs": [
        { "headerName": "Name", "field": "name", "sortable": true }
      ]
    }
  }
}
```
