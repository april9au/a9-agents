# Stack9 v5: Screen Definitions

## What's New

v3 auto-generated all screens from entity definitions.  
v5 requires **explicit screen JSON files** in `src/screens/` for each screen.

## File Location

```
packages/stack9-stack/src/screens/{screen_name}.json
```

## Screen Types

| `screenType` | Description |
|---|---|
| `simpleCrud` | **Use this for standard CRUD.** Combines list + create + update in one screen. Has a built-in create button. |
| `listView` | Read-only grid with no create button. Use only for reporting or dashboards. |
| `detailView` | Custom component-tree screen. Use only when you need a fully custom layout. |

**For v3 → v5 CRUD migration, always use `simpleCrud`.** The `listView` + `detailView` pattern has no create button — do not use it for standard entity management screens.

## simpleCrud Screen (Standard CRUD)

One file per entity. Handles list, create, and update in a single screen. The framework automatically generates `/list`, `/create`, and `/:id` sub-routes from `head.route`.

```json
{
  "head": {
    "title": "Entities",
    "key": "entity_list",
    "route": "entity-list",
    "app": "app_key",
    "description": "Manage entity records"
  },
  "screenType": "simpleCrud",
  "listQuery": "entity_list",
  "detailQuery": "entity_detail",
  "entityKey": "entity",
  "querySearchFields": ["name"],
  "columnsConfiguration": [
    {
      "renderAs": "Text",
      "field": "name",
      "label": "Name",
      "sorter": true,
      "value": "{{name}}"
    },
    {
      "renderAs": "Date",
      "field": "_created_at",
      "label": "Created",
      "sorter": true,
      "value": "{{_created_at}}"
    }
  ],
  "formFieldset": {
    "create": [
      { "field": "name", "label": "Name", "renderAs": "TextField", "isRequired": true, "colSize": 12 },
      { "field": "status_id", "label": "Status", "renderAs": "SingleDropDown", "isRequired": true, "colSize": 6 }
    ],
    "updateUsesCreateFields": true
  },
  "queries": [
    { "name": "entity_list", "queryKey": "entity_list" },
    { "name": "entity_detail", "queryKey": "entity_detail" },
    { "name": "create_entity", "queryKey": "create_entity" },
    { "name": "update_entity", "queryKey": "update_entity" },
    { "name": "delete_entity", "queryKey": "delete_entity" }
  ]
}
```

### simpleCrud Properties

| Property | Required | Description |
|---|---|---|
| `head.key` | yes | Unique screen key (matches filename without `.json`) |
| `head.route` | yes | Base route in kebab-case — framework appends `/list`, `/create`, `/:id` |
| `head.app` | yes | App key this screen belongs to |
| `listQuery` | yes | Query key for fetching the list |
| `detailQuery` | yes | Query key for fetching a single record |
| `entityKey` | yes | Entity key (snake_case) |
| `querySearchFields` | no | Fields searched by the search box |
| `columnsConfiguration` | yes | Column definitions for the list |
| `formFieldset.create` | yes | Fields shown in the create/edit form |
| `formFieldset.update` | yes* | Fields for edit form — set `updateUsesCreateFields: true` to reuse create fields |
| `queries` | no | All queries available to this screen |

### Navigation Links for simpleCrud

Navigation links must point to the `/list` sub-route:

```json
{ "link": "/app_key/entity-list/list" }
```

Not `/app_key/entity-list` — that resolves to the base route, not the list page.

### formFieldset — Building from Entity Fields

Map entity field types to `FormConfiguration.renderAs`:

| Entity field type | `renderAs` | `colSize` |
|---|---|---|
| `TextField` | `TextField` | `12` |
| `RichTextEditor` | `RichTextEditor` | `12` |
| `MonacoEditorField` | `MonacoEditorField` | `12` |
| `NumericField` | `NumericField` | `6` |
| `DateField` | `DateField` | `6` |
| `DateTimeField` | `DateTimeField` | `6` |
| `Checkbox` | `Checkbox` | `6` |
| `SingleDropDown` | `SingleDropDown` | `6` |
| `MultiDropDown` | `MultiDropDown` | `6` |
| `FileField` | `FileField` | `6` |
| `ImageField` | `ImageField` | `6` |

Skip field types: `Grid`, `CustomUIComponent`, `OptionSet` — these are not supported in formFieldset.

Set `isRequired: true` when the entity field has `validateRules.required === true`.

Use `updateUsesCreateFields: true` to avoid duplicating the field list. The `update` array must still be present (even as `[]`) — the validator requires it.

```json
"formFieldset": {
  "create": [
    { "field": "name", "label": "Name", "renderAs": "TextField", "isRequired": true, "colSize": 12 }
  ],
  "update": [],
  "updateUsesCreateFields": true
}
```

## Column Configuration

### Required Fields

Every column definition MUST include `field`, `label`, `renderAs`, and `value`. Do NOT use `key` — it is not a valid column property.

```json
{
  "renderAs": "Text",
  "field": "name",
  "label": "Name",
  "value": "{{name}}"
}
```

`value` uses Handlebars: `"{{field_name}}"`. For eager-loaded relations: `"{{customer.name}}"`.

### Column `renderAs` Values

| `renderAs` | Use for |
|---|---|
| `Text` | Plain string, with optional `linkProp` |
| `Date` | Date fields |
| `DateTime` | Date + time fields |
| `Currency` | Monetary values |
| `Number` | Numeric values |
| `Boolean` | True/false badge |
| `WorkflowResult` | Workflow step badge |

### Full Column Example

```json
{
  "renderAs": "Text",
  "field": "name",
  "label": "Name",
  "sorter": true,
  "value": "{{name}}"
}
```

## Naming Conventions

| Screen | Key | Route | Filename |
|---|---|---|---|
| CRUD | `entity_list` | `entity-list` | `entity_list.json` |

The same file covers list, create, and update. No separate detail file needed for standard CRUD.

## Mapping v3 gridSettings → v5 columnsConfiguration

v3 entity `gridSettings.agGrid.columnDefs[]` maps to v5 screen `columnsConfiguration[]`:

| v3 `columnDef` | v5 `column` |
|---|---|
| `headerName` | `label` |
| `field` | `field` and `value: "{{field}}"` |
| `sortable: true` | `sorter: true` |

v3 example:
```json
{ "headerName": "Name", "field": "name", "sortable": true }
```

v5 equivalent:
```json
{
  "renderAs": "Text",
  "field": "name",
  "label": "Name",
  "sorter": true,
  "value": "{{name}}"
}
```
