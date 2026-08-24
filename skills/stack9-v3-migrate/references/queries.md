# Stack9 v5: Query Library

## What's New

v3 had no query library — the frontend called entity APIs directly via the Stack9 framework.  
v5 requires **query JSON files** in `src/query-library/` that declare every data operation used by screens.

## File Location

```
packages/stack9-stack/src/query-library/{query_name}.json
```

## Query JSON Structure

```json
{
  "key": "query_key",
  "name": "query_name",
  "connector": "stack9_api | stack9_db",
  "queryTemplate": {
    "method": "get | post | put | delete",
    "path": "/entity[/:id]",
    "bodyParams": "...",
    "queryParams": {}
  },
  "filters": [],
  "userParams": {}
}
```

## Connectors

| Connector | Use for |
|---|---|
| `stack9_api` | Entity CRUD — preserves hooks, validation, audit trail |
| `stack9_db` | Raw SQL — aggregations, dashboards, complex joins (bypasses hooks) |

**Always prefer `stack9_api`** unless you need cross-entity aggregations or performance-critical reads.

## Standard Query Patterns

### List Query

```json
{
  "key": "entity_list",
  "name": "entity_list",
  "connector": "stack9_api",
  "queryTemplate": {
    "method": "post",
    "path": "/entity/search",
    "bodyParams": "{\n  \"$select\": [\n    \"id\",\n    \"name\",\n    \"status\",\n    \"_created_at\",\n    \"_updated_at\"\n  ],\n  \"$where\": {\n    \"_is_deleted\": false\n  },\n  \"$sort\": { \"_updated_at\": \"desc\" }\n}",
    "queryParams": {
      "page": "{{page}}",
      "limit": "{{limit}}"
    }
  },
  "filters": [],
  "userParams": {
    "page": "0",
    "limit": "1000"
  }
}
```

### Detail Query

```json
{
  "key": "entity_detail",
  "name": "entity_detail",
  "connector": "stack9_api",
  "queryTemplate": {
    "method": "post",
    "path": "/entity/search",
    "bodyParams": "{\n  \"$select\": [\"*\"],\n  \"$where\": {\n    \"id\": {{id}},\n    \"_is_deleted\": false\n  }\n}",
    "queryParams": {}
  },
  "userParams": {
    "id": "1"
  }
}
```

### Detail with Relations

```json
{
  "key": "entity_detail",
  "name": "entity_detail",
  "connector": "stack9_api",
  "queryTemplate": {
    "method": "post",
    "path": "/entity/search",
    "bodyParams": "{\n  \"$select\": [\n    \"*\",\n    \"related.id\",\n    \"related.name\"\n  ],\n  \"$where\": {\n    \"id\": {{id}},\n    \"_is_deleted\": false\n  },\n  \"$withRelated\": [\"related\"]\n}",
    "queryParams": {}
  },
  "userParams": {
    "id": "1"
  }
}
```

### Create Query

```json
{
  "key": "create_entity",
  "name": "create_entity",
  "connector": "stack9_api",
  "queryTemplate": {
    "method": "post",
    "path": "/entity",
    "bodyParams": "{{body}}"
  },
  "userParams": {
    "body": {}
  }
}
```

### Update Query

```json
{
  "key": "update_entity",
  "name": "update_entity",
  "connector": "stack9_api",
  "queryTemplate": {
    "method": "put",
    "path": "/entity/{{id}}",
    "bodyParams": "{{body}}"
  },
  "userParams": {
    "id": "1",
    "body": {}
  }
}
```

### Delete Query

```json
{
  "key": "delete_entity",
  "name": "delete_entity",
  "connector": "stack9_api",
  "queryTemplate": {
    "method": "delete",
    "path": "/entity/{{id}}"
  },
  "userParams": {
    "id": "1"
  }
}
```

### Dropdown Query (for relation fields)

```json
{
  "key": "entity_list_dropdown",
  "name": "entity_list_dropdown",
  "connector": "stack9_api",
  "queryTemplate": {
    "method": "post",
    "path": "/entity/search",
    "bodyParams": "{\n  \"$select\": [\"id\", \"name\"],\n  \"$where\": { \"_is_deleted\": false },\n  \"$sort\": { \"name\": \"asc\" }\n}"
  },
  "userParams": {}
}
```

## List Query Filters

Filters appear in the query list screen as filter controls:

```json
"filters": [
  {
    "name": "Customer",
    "key": "customer",
    "typeQueryFilter": "compare",
    "field": "customer_id",
    "typeFilter": "SingleDropDown",
    "useSubquery": false,
    "sequence": 1,
    "dataSource": {
      "type": "query",
      "labelProp": "name",
      "valueProp": "id",
      "query": {
        "name": "customer_list_dropdown",
        "queryKey": "customer_list_dropdown"
      }
    }
  },
  {
    "name": "Status",
    "key": "status",
    "typeQueryFilter": "compare",
    "field": "status",
    "typeFilter": "SingleDropDown",
    "useSubquery": false,
    "sequence": 2,
    "dataSource": {
      "type": "static",
      "options": [
        { "label": "Active", "value": "active" },
        { "label": "Inactive", "value": "inactive" }
      ]
    }
  },
  {
    "name": "Name",
    "key": "name",
    "typeQueryFilter": "compare",
    "field": "name",
    "typeFilter": "StringCompareValue",
    "useSubquery": false,
    "sequence": 3
  },
  {
    "name": "Workflow",
    "key": "workflow",
    "typeQueryFilter": "array",
    "field": "_workflow_current_step",
    "typeFilter": "MultiDropDown",
    "useSubquery": false,
    "sequence": 4,
    "dataSource": {
      "type": "query",
      "labelProp": "label",
      "valueProp": "value",
      "query": {
        "name": "get_entity_workflowsteps",
        "queryKey": "get_entity_workflowsteps"
      }
    }
  }
]
```

| `typeQueryFilter` | Use for |
|---|---|
| `compare` | Single value equality |
| `array` | Multi-select (IN clause) |
| `range` | Date or number range |

| `typeFilter` | UI control |
|---|---|
| `SingleDropDown` | Single select from list |
| `MultiDropDown` | Multi select from list |
| `StringCompareValue` | Text search |
| `DateRange` | Date range picker |

## Invalid bodyParams Properties — Do Not Use

These properties are NOT part of the v5 `S9Query` schema and will be silently ignored or cause runtime errors:

| Wrong | Correct |
|---|---|
| `$orderBy: [{ column: "x", order: "desc" }]` | `$sort: { "x": "desc" }` |
| `$limit: "{{limit}}"` in bodyParams | use `queryParams: { "page": "{{page}}", "limit": "{{limit}}" }` |
| `$offset: "{{offset}}"` in bodyParams | use `queryParams` with `page` |

The `name` field in a query must exactly match the `key` (snake_case), not be camelCase.

## What Queries to Create for Each Entity

For a basic CRUD migration, create:
1. `{entity}_list.json` — paginated list with filters
2. `{entity}_detail.json` — single record with relations
3. `create_{entity}.json` — POST to create
4. `update_{entity}.json` — PUT to update
5. `delete_{entity}.json` — DELETE (soft)
6. `{entity}_list_dropdown.json` — for use as relation dropdowns in other screens

If the entity has children (Grid fields), also create CRUD queries for child entities.
